import { useParams } from "react-router-dom";
import { useClub } from "../../hooks/useClubs";
import { usePermissions } from "../../hooks/usePermissions";
import { Skeleton } from "../../components/ui/Skeleton";
import { ClubInfoForm } from "./manage/ClubInfoForm";
import { MembersSection } from "./manage/MembersSection";
import { DepartmentsSection } from "./manage/DepartmentsSection";
import { FacultyCoordinatorSection } from "./manage/FacultyCoordinatorSection";
import { TransferClubHeadSection } from "./manage/TransferClubHeadSection";
import { GallerySection } from "./manage/GallerySection";

export function ClubManage() {
  const { id } = useParams<{ id: string }>();
  const { isSuperAdmin } = usePermissions();
  const clubQuery = useClub(id);

  if (clubQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (clubQuery.isError || !clubQuery.data) {
    return <p className="text-sm text-rose-400">Couldn't load this club.</p>;
  }

  const club = clubQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">Club management</span>
        <h1 className="mt-1 text-xl font-semibold text-white">{club.name}</h1>
        <p className="text-sm text-slate-500">Club info, members, and departments.</p>
      </div>

      <ClubInfoForm club={club} />
      <MembersSection clubId={club.id} />
      <DepartmentsSection clubId={club.id} />
      <GallerySection clubId={club.id} />
      {isSuperAdmin && <FacultyCoordinatorSection club={club} />}
      {isSuperAdmin && <TransferClubHeadSection club={club} />}
    </div>
  );
}
