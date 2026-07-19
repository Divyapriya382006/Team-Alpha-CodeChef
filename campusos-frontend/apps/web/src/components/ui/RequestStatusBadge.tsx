import type { EventStatus, RequestStatus } from "../../types";

type Status = RequestStatus | EventStatus;

const STYLES: Record<Status, string> = {
  PENDING: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30",
  APPROVED: "bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30",
  REJECTED: "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/30",
};

interface RequestStatusBadgeProps {
  status: Status;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  return <span className={`badge ${STYLES[status]}`}>{status.charAt(0) + status.slice(1).toLowerCase()}</span>;
}
