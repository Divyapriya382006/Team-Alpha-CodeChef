import { Link } from "react-router-dom";
import type { BlogSummary } from "../../types";

interface BlogCardProps {
  blog: BlogSummary;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link to={`/blogs/${blog.id}`} className="surface-interactive group flex flex-col p-5 bg-white border-2 border-ink shadow-brutal hover:shadow-brutal-lg transition-all duration-100 rounded-none">
      <h3 className="text-sm font-bold font-display text-ink">{blog.title}</h3>
      <p className="mt-1.5 font-mono text-xs text-muted">
        {new Date(blog.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </p>
      {blog.tags.length > 0 && (
        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t-2 border-ink pt-3">
          {blog.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="badge bg-paper text-ink border border-ink rounded-none text-[10px] px-1.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
