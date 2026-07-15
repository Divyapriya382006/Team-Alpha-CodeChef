// Used in GET /blogs list and Search results — excludes content.
export interface BlogSummary {
  id: string;
  clubId: string | null;
  departmentId: string | null;
  title: string;
  tags: string[];
  thumbnailUrl: string | null;
  authorId: string;
  publishedAt: string;
}

// GET /blogs/:id — BlogSummary + full content.
export interface BlogDetail extends BlogSummary {
  content: string;
}
