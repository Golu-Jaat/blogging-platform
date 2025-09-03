import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import BlogList from "./pages/BlogList";
import BlogView from "./pages/BlogView";
import BlogEditor from "./pages/BlogEditor";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Home />} />
      <Route path="/blogs" element={<BlogList />} />
      <Route
        path="/blogs/new"
        element={
          <ProtectedRoute>
            <BlogEditor />
          </ProtectedRoute>
        }
      />
      <Route path="/blogs/:id" element={<BlogView />} />
      <Route
        path="/blogs/:id/edit"
        element={
          <ProtectedRoute>
            <BlogEditor />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
