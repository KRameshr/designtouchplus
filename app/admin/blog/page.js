"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { adminFetch } from "@/lib/auth";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/api/blogs/admin/all");
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await adminFetch(`/api/blogs/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaved = () => {
    setEditingPost(null);
    loadPosts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-black uppercase mb-1">Blog</h1>
          <p className="text-gray-500 text-sm">{posts.length} posts</p>
        </div>
        <button
          onClick={() => setEditingPost({})}
          className="inline-flex items-center gap-2 bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full border-none cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-500 text-sm">No blog posts yet — click &quot;New Post&quot; to add one.</p>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Title</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-white/[0.06] last:border-0">
                  <td className="px-4 py-3 text-white font-medium">{post.title}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{post.category?.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    {post.isPublished !== false ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-brand-green">
                        <Eye className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-gray-500">
                        <EyeOff className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingPost(post)}
                        aria-label="Edit"
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 border-none cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        aria-label="Delete"
                        className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center text-gray-300 hover:text-red-400 border-none cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingPost !== null && (
        <BlogPostForm
          post={Object.keys(editingPost).length ? editingPost : null}
          onClose={() => setEditingPost(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
