import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "../components/Editor";
import { createBlog, getBlog, updateBlog } from "../api/blogs";

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const res = await getBlog(id);
          setTitle(res.data.title || "");
          setContent(res.data.content || "");
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [id, isEdit]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { title, content };
      if (isEdit) {
        await updateBlog(id, payload);
        navigate(`/blogs/${id}`);
      } else {
        const res = await createBlog(payload);
        const created = res.data;
        navigate(`/blogs/${created.slug || created._id}`);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-100">{isEdit ? "Edit Post" : "New Post"}</h1>
      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Editor value={content} onChange={setContent} />
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
