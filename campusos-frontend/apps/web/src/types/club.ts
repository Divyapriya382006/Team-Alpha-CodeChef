import type { ClubStatus, ClubRole } from "./enums";

// Finalized decision 6.3: this is the complete, final key set. No other platform key is supported.
export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  facultyDetails: string;
  socialLinks: SocialLinks;
  logoUrl: string | null;
  status: ClubStatus;
  facultyCoordinatorId: string | null;
  createdAt: string;
}

export interface DepartmentSummary {
  id: string;
  name: string;
}

// GET /clubs/:id — Club + departments[].
export interface ClubDetail extends Club {
  departments: DepartmentSummary[];
}

// GET /clubs/:id/members — Member view (any club member).
export interface ClubMemberBase {
  userId: string;
  name: string;
  role: ClubRole;
}

// GET /clubs/:id/members — Club Head / Super Admin view (adds email).
export interface ClubMemberWithEmail extends ClubMemberBase {
  email: string;
}

export type ClubMember = ClubMemberBase | ClubMemberWithEmail;
