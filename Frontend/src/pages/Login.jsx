import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { loginUser } from "../slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ identifier, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form onSubmit={onSubmit} className="bg-slate-900/80 backdrop-blur rounded-xl shadow-2xl border border-slate-800 p-6 space-y-5">
          <h1 className="text-3xl font-extrabold text-slate-100 text-center">Login</h1>
          {error && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 text-white py-2.5 font-semibold shadow-lg hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-sm text-center text-slate-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
