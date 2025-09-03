const express = require("express");
const { auth } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/me - current user profile (protected)
router.get("/me", auth, async (req, res) => {
  return res.json({ success: true, data: { user: req.user } });
});

module.exports = router;
