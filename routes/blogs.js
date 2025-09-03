const express = require("express");
const { body, validationResult, query } = require("express-validator");
const mongoose = require("mongoose");
const { auth, optionalAuth } = require("../middleware/auth");
const Blog = require("../models/Blog");

const router = express.Router();

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const canManagePost = (user, blog) => {
	if (!user) return false;
	if (user.role === "admin") return true;
	return String(blog.author) === String(user._id);
};

// POST /api/blogs - create blog (protected)
router.post(
	"/",
	auth,
	[
		body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 chars"),
		body("content").isLength({ min: 1 }).withMessage("Content is required"),
		body("status").optional().isIn(["draft", "published", "archived"]).withMessage("Invalid status"),
		body("categories").optional().isArray().withMessage("Categories must be an array"),
		body("tags").optional().isArray().withMessage("Tags must be an array"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
		}

		try {
			const { title, content, status = "draft", categories = [], tags = [], featuredImage, seoTitle, seoDescription } = req.body;

			const blog = new Blog({
				title,
				content,
				status,
				categories,
				tags,
				featuredImage: featuredImage || "",
				seoTitle,
				seoDescription,
				author: req.user._id,
				isPublished: status === "published",
				publishedAt: status === "published" ? new Date() : undefined,
			});

			await blog.save();
			const populated = await blog.populate("author", "username firstName lastName avatar role");

			return res.status(201).json({ success: true, message: "Blog created", data: populated });
		} catch (error) {
			console.error("Create blog error:", error);
			return res.status(500).json({ success: false, message: "Server error while creating blog" });
		}
	}
);

// GET /api/blogs - list blogs (public, with optional auth)
router.get(
	"/",
	[
		optionalAuth,
		query("page").optional().isInt({ min: 1 }).toInt(),
		query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
		query("q").optional().isString(),
		query("category").optional().isString(),
		query("tag").optional().isString(),
		query("author").optional().isString(),
		query("status").optional().isIn(["draft", "published", "archived"]),
		query("mine").optional().isIn(["true", "false"]),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
		}

		try {
			const page = req.query.page || 1;
			const limit = req.query.limit || 10;
			const skip = (page - 1) * limit;

			const { q, category, tag, author, status, mine } = req.query;
			const filter = {};

			// Default: only published
			if (!status && mine !== "true") {
				filter.isPublished = true;
			}

			// Explicit status: only allow non-published for owner or admin
			if (status) {
				if (status === "published") filter.isPublished = true;
				if (status === "draft") {
					if (!req.user) return res.status(401).json({ success: false, message: "Auth required for drafts" });
					// If not admin, restrict to own drafts
					if (req.user.role !== "admin") filter.author = req.user._id;
					filter.status = "draft";
				}
				if (status === "archived") {
					if (!req.user || req.user.role !== "admin") return res.status(403).json({ success: false, message: "Admin only for archived" });
					filter.status = "archived";
				}
			}

			// Mine filter
			if (mine === "true") {
				if (!req.user) return res.status(401).json({ success: false, message: "Auth required for mine=true" });
				filter.author = req.user._id;
			}

			if (q) {
				filter.$text = { $search: q };
			}
			if (category) {
				filter.categories = category;
			}
			if (tag) {
				filter.tags = tag;
			}
			if (author) {
				filter.author = isObjectId(author) ? author : undefined;
			}

			const sort = { publishedAt: -1, createdAt: -1 };

			const [items, total] = await Promise.all([
				Blog.find(filter)
					.populate("author", "username firstName lastName avatar role")
					.sort(sort)
					.skip(skip)
					.limit(limit),
				Blog.countDocuments(filter),
			]);

			return res.json({
				success: true,
				data: items,
				meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
			});
		} catch (error) {
			console.error("List blogs error:", error);
			return res.status(500).json({ success: false, message: "Server error while listing blogs" });
		}
	}
);

// Helper: fetch blog by id or slug with access control
async function getAccessibleBlog(param, user) {
	const byId = isObjectId(param);
	const blog = await Blog.findOne(byId ? { _id: param } : { slug: param })
		.populate("author", "username firstName lastName avatar role");
	if (!blog) return { error: { code: 404, message: "Blog not found" } };

	if (!blog.isPublished) {
		const allowed = user && canManagePost(user, blog);
		if (!allowed) return { error: { code: 403, message: "Not authorized to view this blog" } };
	}
	return { blog };
}

// GET /api/blogs/:idOrSlug - get single blog (public with restrictions)
router.get("/:idOrSlug", optionalAuth, async (req, res) => {
	try {
		const { idOrSlug } = req.params;
		const { blog, error } = await getAccessibleBlog(idOrSlug, req.user);
		if (error) return res.status(error.code).json({ success: false, message: error.message });
		return res.json({ success: true, data: blog });
	} catch (error) {
		console.error("Get blog error:", error);
		return res.status(500).json({ success: false, message: "Server error while fetching blog" });
	}
});

// PUT /api/blogs/:id - update blog (protected)
router.put(
	"/:id",
	auth,
	[
		body("title").optional().trim().isLength({ min: 3, max: 200 }).withMessage("Title must be 3-200 chars"),
		body("content").optional().isLength({ min: 1 }).withMessage("Content cannot be empty"),
		body("status").optional().isIn(["draft", "published", "archived"]).withMessage("Invalid status"),
		body("categories").optional().isArray().withMessage("Categories must be an array"),
		body("tags").optional().isArray().withMessage("Tags must be an array"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
		}

		try {
			const blog = await Blog.findById(req.params.id);
			if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

			if (!canManagePost(req.user, blog)) {
				return res.status(403).json({ success: false, message: "Not authorized to update this blog" });
			}

			const updatable = ["title", "content", "status", "categories", "tags", "featuredImage", "seoTitle", "seoDescription"];
			for (const key of updatable) {
				if (req.body[key] !== undefined) blog[key] = req.body[key];
			}

			// Handle publish flags
			if (blog.status === "published") {
				blog.isPublished = true;
				if (!blog.publishedAt) blog.publishedAt = new Date();
			} else {
				blog.isPublished = false;
			}

			await blog.save();
			const populated = await blog.populate("author", "username firstName lastName avatar role");
			return res.json({ success: true, message: "Blog updated", data: populated });
		} catch (error) {
			console.error("Update blog error:", error);
			return res.status(500).json({ success: false, message: "Server error while updating blog" });
		}
	}
);

// DELETE /api/blogs/:id - delete blog (protected)
router.delete("/:id", auth, async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id);
		if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
		if (!canManagePost(req.user, blog)) {
			return res.status(403).json({ success: false, message: "Not authorized to delete this blog" });
		}
		await blog.deleteOne();
		return res.json({ success: true, message: "Blog deleted" });
	} catch (error) {
		console.error("Delete blog error:", error);
		return res.status(500).json({ success: false, message: "Server error while deleting blog" });
	}
});

module.exports = router;

