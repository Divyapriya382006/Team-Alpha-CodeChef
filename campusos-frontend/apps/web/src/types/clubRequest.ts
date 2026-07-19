import type { RequestStatus } from "./enums";

export interface ClubRequest {
  id: string;
  clubName: string;
  description: string;
  facultyDetails: string;
  reason: string;
  requestedBy: string;
  status: RequestStatus;
  createdAt: string;
}

// GET /club-requests/:id — ClubRequest + reviewedBy, rejectionReason.
export interface ClubRequestDetail extends ClubRequest {
  reviewedBy: string | null;
  rejectionReason: string | null;
}
