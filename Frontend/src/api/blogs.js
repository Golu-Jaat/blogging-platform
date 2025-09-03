import api from "../api/client";

export const listBlogs = async (params = {}) => {
  const { data } = await api.get("/api/blogs", { params });
  return data;
};

export const getBlog = async (idOrSlug) => {
  const { data } = await api.get(`/api/blogs/${idOrSlug}`);
  return data;
};

export const createBlog = async (payload) => {
  const { data } = await api.post("/api/blogs", payload);
  return data;
};

export const updateBlog = async (id, payload) => {
  const { data } = await api.put(`/api/blogs/${id}`, payload);
  return data;
};

export const deleteBlog = async (id) => {
  const { data } = await api.delete(`/api/blogs/${id}`);
  return data;
};
