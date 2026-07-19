import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { useBlog, useDeleteBlog } from "../../hooks/useBlogs";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Skeleton } from "../../components/ui/Skeleton";
import { ApiError } from "../../lib/apiError";

export function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isClubHeadOf } = usePermissions();
  const blogQuery = useBlog(id);
  const deleteBlog = useDeleteBlog();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (blogQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (blogQuery.isError) {
    const status = blogQuery.error instanceof ApiError ? blogQuery.error.status : 500;
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-white">{status === 404 ? "Blog not found" : "Something went wrong"}</h1>
        <Link to="/blogs" className="mt-3 inline-block text-sm text-brand-400 hover:text-brand-300">
          Back to blogs
        </Link>
      </div>
    );
  }

  const blog = blogQuery.data!;
  const canManage = !!user && (user.id === blog.authorId || (blog.clubId ? isClubHeadOf(blog.clubId) : false));

  async function handleDelete() {
    setError(null);
    try {
      await deleteBlog.mutateAsync(blog.id);
      navigate("/blogs");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete blog");
      setConfirmDelete(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <div className="surface p-6">
        <h1 className="text-xl font-semibold text-white">{blog.title}</h1>
        <p className="mt-1 font-mono text-xs text-slate-500">
          {new Date(blog.publishedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </p>

        {blog.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {blog.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 whitespace-pre-wrap border-t border-slate-800 pt-5 text-sm leading-relaxed text-slate-300">
          {blog.content}
        </div>

        {error && <p className="mt-4 rounded-lg border border-rose-900/50 bg-rose-950/40 px-3 py-2 text-sm text-rose-300">{error}</p>}

        {canManage && (
          <div className="mt-5 border-t border-slate-800 pt-4">
            <button type="button" onClick={() => setConfirmDelete(true)} className="btn-danger !px-3 !py-1.5 text-xs">
              Delete
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this blog post?"
        message="This can't be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={deleteBlog.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
