import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blogsApi, type CreateBlogPayload, type ListBlogsParams } from "../lib/api/blogs";

export function useBlogs(params: ListBlogsParams) {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => blogsApi.list(params),
  });
}

export function useBlog(id: string | undefined) {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: () => blogsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateBlog(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBlogPayload) => blogsApi.create(clubId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blogs"] }),
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blogs"] }),
  });
}
