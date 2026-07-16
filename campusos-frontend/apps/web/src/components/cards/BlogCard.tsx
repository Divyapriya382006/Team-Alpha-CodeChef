import { Link } from "react-router-dom";
import type { BlogSummary } from "../../types";

interface BlogCardProps {
  blog: BlogSummary;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link to={`/blogs/${blog.id}`} className="surface-interactive group flex flex-col p-5">
      <h3 className="text-sm font-semibold text-slate-100 transition group-hover:text-white">{blog.title}</h3>
      <p className="mt-1.5 font-mono text-xs text-slate-500">
        {new Date(blog.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </p>
      {blog.tags.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-slate-800 pt-3">
          {blog.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
