import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { galleryApi, type GalleryParams } from "../lib/api/gallery";
import { useAuthContext } from "../context/AuthContext";

export function useGalleryItems(params: GalleryParams) {
  return useQuery({
    queryKey: ["gallery", params],
    queryFn: () => galleryApi.list(params),
  });
}

export function useAddGalleryItem(clubId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  return useMutation({
    mutationFn: (payload: { imageUrl: string; caption?: string | null }) =>
      galleryApi.add(clubId, payload, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useDeleteGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => galleryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}
