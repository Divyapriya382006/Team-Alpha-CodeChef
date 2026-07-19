import { useState } from "react";
import { useGalleryItems } from "../../hooks/useGallery";
import { useClubs } from "../../hooks/useClubs";
import { FormSelect } from "../../components/ui/FormField";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";

const GALLERY_MOCK = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    caption: 'Annual Tech Fest 2024',
    clubName: 'Coding Club',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
    caption: 'Hackathon Night',
    clubName: 'Coding Club',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80',
    caption: 'Open Mic Night',
    clubName: 'Music Society',
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    caption: 'Leadership Workshop',
    clubName: 'Entrepreneurship Cell',
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1561489401-fc2876ced162?w=800&q=80',
    caption: 'Dance Showcase',
    clubName: 'Dance Crew',
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    caption: 'Photography Walk',
    clubName: 'Photography Club',
  },
  {
    id: '7',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    caption: 'Campus Outdoor Shoot',
    clubName: 'Photography Club',
  },
  {
    id: '8',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    caption: 'Robotics Demo Day',
    clubName: 'Robotics Club',
  },
  {
    id: '9',
    imageUrl: 'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?w=800&q=80',
    caption: 'Literary Fest',
    clubName: 'Literary Society',
  },
];

export function Gallery() {
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 9; // Grid display limit

  // Load clubs for filtering
  const { data: clubsData } = useClubs({ limit: 100 });
  const clubOptions = [
    { value: "", label: "All Clubs" },
    ...(clubsData?.items.map((club) => ({
      value: club.id,
      label: club.name,
    })) || []),
  ];

  // Load gallery items
  const { data: galleryData, isLoading, isError } = useGalleryItems({
    clubId: selectedClubId || undefined,
    page,
    limit,
  });

  const displayItems = (galleryData?.items && galleryData.items.length > 0) ? galleryData.items : GALLERY_MOCK;

  const handleClubChange = (clubId: string) => {
    setSelectedClubId(clubId);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-in">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">Moments & Memories</span>
          <h1 className="mt-2 text-4xl tracking-tight" style={{color: '#0A0A0A', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800}}>Community Gallery</h1>
          <p className="mt-2 text-sm" style={{color: '#555555'}}>
            A visual showcase of events, workshops, hackathons, and activities across student communities.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <FormSelect
            label="Filter by Club"
            name="clubFilter"
            value={selectedClubId}
            onChange={(e) => handleClubChange(e.target.value)}
            options={clubOptions}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : isError ? (
        <div className="surface border-2 border-ink p-6 text-center bg-white rounded-none shadow-brutal">
          <p className="text-sm text-[#FF3B3B] font-bold">Failed to load gallery images.</p>
        </div>
      ) : displayItems.length === 0 ? (
        <EmptyState title="No images found" description="Try selecting a different club filter or upload some images first." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {displayItems.map((item) => {
              const matchedClub = 'clubId' in item ? clubsData?.items.find((c) => c.id === (item as any).clubId) : null;
              return (
                <div
                  key={item.id}
                  style={{
                    border: '2px solid #0A0A0A',
                    boxShadow: '4px 4px 0px #0A0A0A',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 80ms ease-out, box-shadow 80ms ease-out',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translate(-2px, -2px)';
                    e.currentTarget.style.boxShadow = '6px 6px 0px #0A0A0A';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translate(0,0)';
                    e.currentTarget.style.boxShadow = '4px 4px 0px #0A0A0A';
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.caption || "Gallery image"}
                    style={{width: '100%', height: 220, objectFit: 'cover', display: 'block'}}
                  />
                  <div style={{
                    backgroundColor: '#0A0A0A',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}>
                    <span style={{color: '#FFFFFF', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'normal', wordBreak: 'break-word'}}>
                      {item.caption || ""}
                    </span>
                    <span style={{
                      backgroundColor: '#C8F135',
                      color: '#0A0A0A',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '1px 6px',
                      border: '1px solid #0A0A0A',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {(item as any).clubName || matchedClub?.name || "Community"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {galleryData && galleryData.items.length > 0 && (
            <div className="mt-8">
              <Pagination pagination={galleryData.pagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
