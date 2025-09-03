import { useEffect, useState } from "react";
import { listBlogs } from "../api/blogs";
import { Link } from "react-router-dom";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await listBlogs({ page: 1, limit: 10 });
        setBlogs(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-slate-300">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Blogs</h1>
        <Link to="/blogs/new" className="rounded-md bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">New Post</Link>
      </div>
      <div className="space-y-3">
        {blogs.map((b) => (
          <Link key={b._id} to={`/blogs/${b.slug || b._id}`} className="block rounded border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-100">{b.title}</h2>
            <p className="text-sm text-slate-400">{b.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
