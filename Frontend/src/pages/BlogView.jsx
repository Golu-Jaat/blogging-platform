import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlog } from "../api/blogs";

export default function BlogView() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBlog(id);
        setBlog(res.data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  if (!blog) return <div className="p-6 text-slate-300">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-slate-100">{blog.title}</h1>
      <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />
      <div className="flex gap-3">
        <Link to={`/blogs/${blog._id}/edit`} className="rounded-md bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">Edit</Link>
        <Link to={`/`} className="rounded-md border border-slate-700 text-slate-200 px-3 py-2 hover:bg-slate-800">Back</Link>
      </div>
    </div>
  );
}
