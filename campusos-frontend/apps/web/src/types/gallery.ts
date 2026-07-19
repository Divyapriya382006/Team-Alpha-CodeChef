export interface GalleryItem {
  id: string;
  clubId: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}
