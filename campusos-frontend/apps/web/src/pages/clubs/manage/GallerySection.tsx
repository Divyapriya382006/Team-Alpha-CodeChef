import { useState, type FormEvent } from "react";
import { useGalleryItems, useAddGalleryItem, useDeleteGalleryItem } from "../../../hooks/useGallery";
import { FormField } from "../../../components/ui/FormField";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ApiError } from "../../../lib/apiError";

interface GallerySectionProps {
  clubId: string;
}

export function GallerySection({ clubId }: GallerySectionProps) {
  const galleryQuery = useGalleryItems({ clubId, limit: 100 });
  const addGalleryItem = useAddGalleryItem(clubId);
  const deleteGalleryItem = useDeleteGalleryItem();

  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await addGalleryItem.mutateAsync({ imageUrl, caption });
      setImageUrl("");
      setCaption("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not upload image");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this photo from the gallery?")) {
      try {
        await deleteGalleryItem.mutateAsync(id);
      } catch (err) {
        alert(err instanceof ApiError ? err.message : "Could not delete image");
      }
    }
  }

  return (
    <div className="surface p-6">
      <h2 className="text-base font-semibold">Gallery Management</h2>
      <p className="text-xs text-muted mt-1">Manage photo uploads and captions showcased on the public profile.</p>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-b border-slate-900 pb-5">
        <FormField
          label="Image URL"
          name="imageUrl"
          placeholder="https://images.unsplash.com/..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <FormField
          label="Caption (Optional)"
          name="caption"
          placeholder="Describe the moment..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={addGalleryItem.isPending || !imageUrl.trim()}
          className="btn-primary"
        >
          {addGalleryItem.isPending ? "Adding…" : "Add to Gallery"}
        </button>
      </form>

      {/* List / Grid of Images */}
      {galleryQuery.isLoading ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      ) : galleryQuery.data && galleryQuery.data.items.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {galleryQuery.data.items.map((item) => (
            <div key={item.id} className="relative group overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
              <img
                src={item.imageUrl}
                alt={item.caption || "Gallery image"}
                className="aspect-video w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition duration-200">
                <p className="text-[10px] text-slate-300 line-clamp-3">{item.caption || "No caption"}</p>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteGalleryItem.isPending}
                  className="w-full text-center py-1 text-[10px] text-rose-400 font-semibold bg-rose-500/10 hover:bg-rose-500/25 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted">No gallery images uploaded yet.</p>
      )}
    </div>
  );
}
