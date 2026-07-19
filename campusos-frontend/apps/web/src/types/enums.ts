// Mirrors FINAL_TEAM_BUILD_GUIDE.md "Database Setup > Enums" exactly.

export type PlatformRole = "SUPER_ADMIN" | "FACULTY_COORDINATOR" | "STUDENT";

export type ClubRole = "CLUB_HEAD" | "MEMBER";

export type ClubStatus = "ACTIVE";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type EventType = "PUBLIC" | "CLUB_EXCLUSIVE";

export type EventStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ProjectStatus = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export type AnnouncementVisibility = "GLOBAL" | "CLUB" | "DEPARTMENT";
