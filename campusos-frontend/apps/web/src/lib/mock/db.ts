import { getToken } from "../tokenStorage";
import type {
  AnnouncementVisibility,
  ClubRole,
  ClubStatus,
  EventStatus,
  EventType,
  PlatformRole,
  ProjectStatus,
  SocialLinks,
} from "../../types";

// Single in-memory "database" shared by every lib/mock/*.ts module, so records stay consistent
// with each other (e.g. Asha Rao is Club Head of club-1 in both club_memberships and, via
// getClubMembershipsForUser, in GET /auth/me's clubMemberships[]). Swapped out entirely once
// VITE_USE_MOCK=false points the app at the real apps/api.

export const MOCK_LATENCY_MS = 400;

export function delay<T>(value: T, ms = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function paginate<T>(items: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

// ---------- users ----------

export interface MockUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  platformRole: PlatformRole;
  createdAt: string;
}

export const mockUsersDb: MockUserRecord[] = [
  { id: "user-admin", name: "Priya Nair", email: "admin@campusos.edu", password: "password123", platformRole: "SUPER_ADMIN", createdAt: "2025-07-01T09:00:00Z" },
  { id: "user-faculty", name: "Dr. Ramesh Iyer", email: "faculty@campusos.edu", password: "password123", platformRole: "FACULTY_COORDINATOR", createdAt: "2025-07-01T09:00:00Z" },
  { id: "user-faculty-2", name: "Dr. Anita Verma", email: "anita@campusos.edu", password: "password123", platformRole: "FACULTY_COORDINATOR", createdAt: "2025-07-01T09:00:00Z" },
  { id: "user-clubhead", name: "Asha Rao", email: "asha@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-07-15T09:00:00Z" },
  { id: "user-member", name: "Kabir Shah", email: "member@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-07-16T09:00:00Z" },
  { id: "user-clubhead-2", name: "Dev Malhotra", email: "dev@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-08-01T09:00:00Z" },
  { id: "user-member-2", name: "Rhea Fernandes", email: "rhea@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-08-02T09:00:00Z" },
  { id: "user-clubhead-3", name: "Meera Joseph", email: "meera@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2026-02-01T09:00:00Z" },
  { id: "user-unaffiliated", name: "Zara Khan", email: "zara@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2026-06-01T09:00:00Z" },
  { id: "user-faculty-3", name: "Dr. Vikram Nair", email: "vikram@campusos.edu", password: "password123", platformRole: "FACULTY_COORDINATOR", createdAt: "2025-09-01T09:00:00Z" },
  { id: "user-faculty-4", name: "Dr. Farah Sheikh", email: "farah@campusos.edu", password: "password123", platformRole: "FACULTY_COORDINATOR", createdAt: "2025-09-01T09:00:00Z" },
  { id: "user-faculty-5", name: "Dr. Meenal Rao", email: "meenal@campusos.edu", password: "password123", platformRole: "FACULTY_COORDINATOR", createdAt: "2025-09-01T09:00:00Z" },
  { id: "user-faculty-6", name: "Dr. Arjun Malhotra", email: "arjun@campusos.edu", password: "password123", platformRole: "FACULTY_COORDINATOR", createdAt: "2025-09-01T09:00:00Z" },
  { id: "user-clubhead-4", name: "Ishaan Kapoor", email: "ishaan@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-09-05T09:00:00Z" },
  { id: "user-clubhead-5", name: "Naina Bhatt", email: "naina@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-09-06T09:00:00Z" },
  { id: "user-clubhead-6", name: "Rohan Verma", email: "rohan@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-09-07T09:00:00Z" },
  { id: "user-clubhead-7", name: "Kavya Iyer", email: "kavya@campusos.edu", password: "password123", platformRole: "STUDENT", createdAt: "2025-09-08T09:00:00Z" },
];

// ---------- clubs ----------

export interface MockClubRecord {
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

export const mockClubsDb: MockClubRecord[] = [
  {
    id: "club-1",
    name: "Robotics Club",
    description: "Building and competing with autonomous robots.",
    facultyDetails: "Advised by the Dept. of Mechanical Engineering.",
    socialLinks: { instagram: "https://instagram.com/campusos_robotics", github: "https://github.com/campusos-robotics" },
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId: "user-faculty",
    createdAt: "2025-08-01T10:00:00Z",
  },
  {
    id: "club-2",
    name: "Photography Club",
    description: "Capturing campus life one frame at a time.",
    facultyDetails: "Advised by the Dept. of Visual Arts.",
    socialLinks: { instagram: "https://instagram.com/campusos_photo" },
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId: "user-faculty-2",
    createdAt: "2025-09-15T10:00:00Z",
  },
  {
    id: "club-3",
    name: "Literary Society",
    description: "A space for readers, writers, and poets.",
    facultyDetails: "Awaiting faculty coordinator assignment.",
    socialLinks: {},
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId: null,
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "club-4",
    name: "Music Society",
    description: "Jam sessions, open mics, and campus gig nights.",
    facultyDetails: "Advised by the Dept. of Performing Arts.",
    socialLinks: { instagram: "https://instagram.com/campusos_music" },
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId: "user-faculty-3",
    createdAt: "2025-09-05T10:00:00Z",
  },
  {
    id: "club-5",
    name: "Coding Club",
    description: "Competitive programming, hackathons, and open source.",
    facultyDetails: "Advised by the Dept. of Computer Science.",
    socialLinks: { github: "https://github.com/campusos-coding" },
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId: "user-faculty-4",
    createdAt: "2025-09-06T10:00:00Z",
  },
  {
    id: "club-6",
    name: "Dance Crew",
    description: "Hip-hop, contemporary, and classical dance on campus.",
    facultyDetails: "Advised by the Dept. of Performing Arts.",
    socialLinks: { instagram: "https://instagram.com/campusos_dance" },
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId: "user-faculty-5",
    createdAt: "2025-09-07T10:00:00Z",
  },
  {
    id: "club-7",
    name: "Entrepreneurship Cell",
    description: "Helping student founders build and pitch real startups.",
    facultyDetails: "Advised by the Dept. of Management Studies.",
    socialLinks: { linkedin: "https://linkedin.com/company/campusos-ecell" },
    logoUrl: null,
    status: "ACTIVE",
    facultyCoordinatorId: "user-faculty-6",
    createdAt: "2025-09-08T10:00:00Z",
  },
];

// ---------- club memberships ----------

export interface MockClubMembershipRecord {
  userId: string;
  clubId: string;
  role: ClubRole;
  joinedAt: string;
}

export const mockClubMembershipsDb: MockClubMembershipRecord[] = [
  { userId: "user-clubhead", clubId: "club-1", role: "CLUB_HEAD", joinedAt: "2025-08-01T10:00:00Z" },
  { userId: "user-member", clubId: "club-1", role: "MEMBER", joinedAt: "2025-08-10T10:00:00Z" },
  { userId: "user-clubhead-2", clubId: "club-2", role: "CLUB_HEAD", joinedAt: "2025-09-15T10:00:00Z" },
  { userId: "user-member-2", clubId: "club-2", role: "MEMBER", joinedAt: "2025-09-20T10:00:00Z" },
  { userId: "user-clubhead-3", clubId: "club-3", role: "CLUB_HEAD", joinedAt: "2026-02-01T10:00:00Z" },
  { userId: "user-clubhead-4", clubId: "club-4", role: "CLUB_HEAD", joinedAt: "2025-09-05T10:00:00Z" },
  { userId: "user-clubhead-5", clubId: "club-5", role: "CLUB_HEAD", joinedAt: "2025-09-06T10:00:00Z" },
  { userId: "user-clubhead-6", clubId: "club-6", role: "CLUB_HEAD", joinedAt: "2025-09-07T10:00:00Z" },
  { userId: "user-clubhead-7", clubId: "club-7", role: "CLUB_HEAD", joinedAt: "2025-09-08T10:00:00Z" },
];

// ---------- departments ----------

export interface MockDepartmentRecord {
  id: string;
  clubId: string;
  name: string;
  headUserId: string | null;
  createdAt: string;
}

export const mockDepartmentsDb: MockDepartmentRecord[] = [
  { id: "dept-1", clubId: "club-1", name: "Web Dev", headUserId: "user-member", createdAt: "2025-08-05T10:00:00Z" },
];

export interface MockDepartmentMembershipRecord {
  userId: string;
  departmentId: string;
  joinedAt: string;
}

export const mockDepartmentMembershipsDb: MockDepartmentMembershipRecord[] = [
  { userId: "user-member", departmentId: "dept-1", joinedAt: "2025-08-10T10:00:00Z" },
];

// ---------- events ----------

export interface MockEventRecord {
  id: string;
  clubId: string;
  title: string;
  description: string;
  location: string;
  type: EventType;
  capacity: number | null;
  startTime: string;
  endTime: string;
  status: EventStatus;
  requestedBy: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
  registrations: string[]; // userIds
}

export const mockEventsDb: MockEventRecord[] = [
  {
    id: "event-1",
    clubId: "club-1",
    title: "Hack Night",
    description: "An overnight build sprint — bring your best robot ideas.",
    location: "Engineering Building, Room 204",
    type: "PUBLIC",
    capacity: 50,
    startTime: "2026-08-01T18:00:00Z",
    endTime: "2026-08-01T23:00:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead",
    reviewedBy: "user-faculty",
    rejectionReason: null,
    createdAt: "2026-07-01T09:00:00Z",
    registrations: ["user-member"],
  },
  {
    id: "event-2",
    clubId: "club-1",
    title: "Internal Strategy Meetup",
    description: "Planning session for the fall competition season.",
    location: "Engineering Building, Room 118",
    type: "CLUB_EXCLUSIVE",
    capacity: null,
    startTime: "2026-08-10T17:00:00Z",
    endTime: "2026-08-10T19:00:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead",
    reviewedBy: "user-faculty",
    rejectionReason: null,
    createdAt: "2026-07-05T09:00:00Z",
    registrations: [],
  },
  {
    id: "event-3",
    clubId: "club-2",
    title: "Golden Hour Shoot",
    description: "A guided campus shoot chasing the best light of the day.",
    location: "Main Quad",
    type: "PUBLIC",
    capacity: 20,
    startTime: "2026-08-05T09:30:00Z",
    endTime: "2026-08-05T11:00:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead-2",
    reviewedBy: "user-faculty-2",
    rejectionReason: null,
    createdAt: "2026-07-02T09:00:00Z",
    registrations: [],
  },
  {
    id: "event-4",
    clubId: "club-3",
    title: "Open Mic Poetry Night",
    description: "Bring a poem, bring a friend — all styles welcome.",
    location: "Library Courtyard",
    type: "PUBLIC",
    capacity: null,
    startTime: "2026-08-12T18:30:00Z",
    endTime: "2026-08-12T20:30:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead-3",
    reviewedBy: null,
    rejectionReason: null,
    createdAt: "2026-07-03T09:00:00Z",
    registrations: [],
  },
  {
    id: "event-5",
    clubId: "club-4",
    title: "Acoustic Night",
    description: "Unplugged sets from student musicians and bands.",
    location: "Student Union, Hall B",
    type: "PUBLIC",
    capacity: 80,
    startTime: "2026-08-15T19:00:00Z",
    endTime: "2026-08-15T22:00:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead-4",
    reviewedBy: "user-faculty-3",
    rejectionReason: null,
    createdAt: "2026-07-04T09:00:00Z",
    registrations: [],
  },
  {
    id: "event-6",
    clubId: "club-5",
    title: "48-Hour Hackathon",
    description: "Build something from scratch with a team over one weekend.",
    location: "Computer Science Building",
    type: "PUBLIC",
    capacity: 100,
    startTime: "2026-08-20T18:00:00Z",
    endTime: "2026-08-22T18:00:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead-5",
    reviewedBy: "user-faculty-4",
    rejectionReason: null,
    createdAt: "2026-07-06T09:00:00Z",
    registrations: [],
  },
  {
    id: "event-7",
    clubId: "club-6",
    title: "Winter Showcase",
    description: "The crew's biggest performance of the semester.",
    location: "Performing Arts Center",
    type: "PUBLIC",
    capacity: 150,
    startTime: "2026-08-25T19:00:00Z",
    endTime: "2026-08-25T21:00:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead-6",
    reviewedBy: "user-faculty-5",
    rejectionReason: null,
    createdAt: "2026-07-07T09:00:00Z",
    registrations: [],
  },
  {
    id: "event-8",
    clubId: "club-7",
    title: "Pitch Night",
    description: "Members-only pitch practice ahead of the regional competition.",
    location: "Management Building, Room 301",
    type: "CLUB_EXCLUSIVE",
    capacity: 30,
    startTime: "2026-08-28T17:00:00Z",
    endTime: "2026-08-28T19:00:00Z",
    status: "APPROVED",
    requestedBy: "user-clubhead-7",
    reviewedBy: "user-faculty-6",
    rejectionReason: null,
    createdAt: "2026-07-08T09:00:00Z",
    registrations: [],
  },
];

// ---------- projects ----------

export interface MockProjectRecord {
  id: string;
  clubId: string;
  departmentId: string | null;
  title: string;
  description: string;
  techStack: string[];
  githubLink: string | null;
  demoLink: string | null;
  thumbnailUrl: string | null;
  contributors: string[];
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
}

export const mockProjectsDb: MockProjectRecord[] = [
  {
    id: "project-1",
    clubId: "club-1",
    departmentId: "dept-1",
    title: "Campus Nav App",
    description: "A React Native app to help freshers navigate campus.",
    techStack: ["React Native", "Node.js"],
    githubLink: "https://github.com/campusos-robotics/campus-nav",
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Asha Rao", "Kabir Shah"],
    status: "IN_PROGRESS",
    createdBy: "user-clubhead",
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "project-2",
    clubId: "club-1",
    departmentId: null,
    title: "Line Follower Bot",
    description: "An autonomous line-following robot built for the spring showcase.",
    techStack: ["C++", "Arduino"],
    githubLink: null,
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Asha Rao"],
    status: "COMPLETED",
    createdBy: "user-clubhead",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "project-3",
    clubId: "club-2",
    departmentId: null,
    title: "Campus Photo Archive",
    description: "A searchable archive of campus event photography going back to 2023.",
    techStack: ["Next.js", "PostgreSQL"],
    githubLink: null,
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Dev Malhotra"],
    status: "IN_PROGRESS",
    createdBy: "user-clubhead-2",
    createdAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "project-4",
    clubId: "club-3",
    departmentId: null,
    title: "Digital Poetry Anthology",
    description: "An online, community-edited anthology of student poetry.",
    techStack: ["Markdown", "Astro"],
    githubLink: null,
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Meera Joseph"],
    status: "COMPLETED",
    createdBy: "user-clubhead-3",
    createdAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "project-5",
    clubId: "club-4",
    departmentId: null,
    title: "Campus Band Finder",
    description: "Match musicians looking for a band by instrument and genre.",
    techStack: ["React", "Firebase"],
    githubLink: null,
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Ishaan Kapoor"],
    status: "IN_PROGRESS",
    createdBy: "user-clubhead-4",
    createdAt: "2026-04-05T10:00:00Z",
  },
  {
    id: "project-6",
    clubId: "club-5",
    departmentId: null,
    title: "Open Source Contribution Tracker",
    description: "Tracks club members' merged pull requests across public repos.",
    techStack: ["TypeScript", "GitHub API"],
    githubLink: "https://github.com/campusos-coding/contribution-tracker",
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Naina Bhatt"],
    status: "IN_PROGRESS",
    createdBy: "user-clubhead-5",
    createdAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "project-7",
    clubId: "club-6",
    departmentId: null,
    title: "Choreography Archive",
    description: "Video-annotated records of every routine performed since 2024.",
    techStack: ["React", "Cloudinary"],
    githubLink: null,
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Rohan Verma"],
    status: "COMPLETED",
    createdBy: "user-clubhead-6",
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "project-8",
    clubId: "club-7",
    departmentId: null,
    title: "Campus Startup Directory",
    description: "A directory of every active student-founded startup on campus.",
    techStack: ["React", "Node.js"],
    githubLink: null,
    demoLink: null,
    thumbnailUrl: null,
    contributors: ["Kavya Iyer"],
    status: "IN_PROGRESS",
    createdBy: "user-clubhead-7",
    createdAt: "2026-05-10T10:00:00Z",
  },
];

// ---------- blogs ----------

export interface MockBlogRecord {
  id: string;
  clubId: string | null;
  departmentId: string | null;
  title: string;
  content: string;
  authorId: string;
  tags: string[];
  thumbnailUrl: string | null;
  publishedAt: string;
}

export const mockBlogsDb: MockBlogRecord[] = [
  {
    id: "blog-1",
    clubId: "club-1",
    departmentId: null,
    title: "How We Won Hackathon X",
    content: "Three weeks before Hackathon X, we didn't have a team, a project, or a plan. What we did have was a whiteboard covered in half-finished robot sketches and a shared conviction that campus events needed a better way to track lost-and-found equipment. That became Fetch — a small autonomous cart that could navigate the Engineering Building and return borrowed lab gear to its shelf.\n\nThe first prototype barely worked. Our chassis kept veering left because of a miscalibrated wheel encoder, and we spent an entire Saturday just debugging PID constants instead of building features. In hindsight, that was the most valuable day of the whole project — once the base movement was solid, everything else (object detection, the pickup arm, the companion app) came together in days instead of weeks.\n\nDemo day itself was chaos in the best way. Our cart's Wi-Fi dropped mid-run, so we improvised a live narration while manually confirming each step worked. The judges said afterward that watching us recover on the fly told them more about the team than a flawless run would have.\n\nIf you're building for a hackathon: budget real time for hardware calibration, not just code. And bring a backup plan for when the demo Wi-Fi inevitably fails.",
    authorId: "user-clubhead",
    tags: ["hackathon", "robotics"],
    thumbnailUrl: null,
    publishedAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "blog-2",
    clubId: "club-2",
    departmentId: null,
    title: "Tips for Shooting in Golden Hour",
    content: "Golden hour gets talked about so often that it's easy to forget how narrow the window actually is — roughly the first and last hour of sunlight, and often closer to twenty sharp minutes near the equator. Our club spent an entire semester shooting the Main Quad at different times just to map out when the light actually gets good, and the results surprised us.\n\nThe biggest mistake we see from newer members: shooting straight into the sun and blowing out the highlights. Instead, try positioning your subject so the light rakes across them from the side — it carves out texture and depth that flat frontal light never will. Backlighting works too, but only if you meter for the subject's face, not the sky, or you'll end up with a silhouette when that's not what you wanted.\n\nOn settings: we default to a lower ISO (100–200) since golden hour gives you plenty of light to work with, and we usually shoot a stop or two under what the camera meters, since golden hour scenes tend to read as overexposed straight out of camera. A polarizing filter helps cut haze if you're shooting toward the horizon.\n\nLast tip — scout your location the day before at the same time you plan to shoot. The quality of light changes fast, and knowing exactly where the shadows will fall saves you from wasting your twenty minutes figuring it out in the moment.",
    authorId: "user-clubhead-2",
    tags: ["photography", "tips"],
    thumbnailUrl: null,
    publishedAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "blog-3",
    clubId: "club-3",
    departmentId: null,
    title: "Why We Still Write Poetry",
    content: "Someone asked me recently why our club still meets every week to write and read poetry out loud, when most of campus communicates in fifteen-second clips. It's a fair question. But I think that's exactly why it matters more, not less.\n\nShort-form video is built for speed — you're meant to feel something in three seconds and move on. Poetry asks you to sit with a single image or line until it opens up. At our last Open Mic, someone read a piece about their grandmother's hands that was maybe forty words long, and the room was completely silent afterward. Nothing on a feed does that to a room of forty strangers.\n\nWe're not precious about form. Half our members write free verse, some write formal sonnets just to feel the constraint, and a few have started experimenting with poetry written specifically to be read aloud over a beat, which blurs into something closer to spoken word. What ties it together isn't the format — it's the insistence on slowness, on saying something and meaning it enough to say it carefully.\n\nIf you've never written a poem past a high school assignment, our meetings are low-pressure. Bring one line. That's enough to start.",
    authorId: "user-clubhead-3",
    tags: ["poetry", "writing"],
    thumbnailUrl: null,
    publishedAt: "2026-04-15T10:00:00Z",
  },
  {
    id: "blog-4",
    clubId: "club-4",
    departmentId: null,
    title: "Behind the Scenes of Acoustic Night",
    content: "Acoustic Night has always been our smallest-budget, highest-effort show, and this year was no exception. With no full band amplification to hide behind, every mixing mistake is audible — so we started sound-checking four hours before doors instead of our usual one.\n\nBooking was the easy part; six acts signed up in the first two days once we opened submissions. The hard part was sequencing the set list so the energy didn't flatline — we alternated higher-tempo duets with quieter solo sets so the room's attention never had time to drift. We also learned, the hard way at a past show, to always soundcheck with the actual performer and their actual instrument. A borrowed guitar the night before sounds nothing like the one that shows up on stage.\n\nStaging-wise, we kept it deliberately minimal: two stools, warm amber lighting, and a single overhead mic pair instead of close-miking everything, which gave the whole night a more intimate, live-room feel instead of a produced one. Our sound lead spent most of the show riding the faders by ear rather than trusting the board's presets, since the Student Union hall has a noticeably different acoustic response once it's full of people versus empty during soundcheck.\n\nBiggest lesson for next time: start soundcheck even earlier, and always have a spare set of instrument cables. We went through three before someone found the one that had gone bad.",
    authorId: "user-clubhead-4",
    tags: ["music", "event"],
    thumbnailUrl: null,
    publishedAt: "2026-04-20T10:00:00Z",
  },
  {
    id: "blog-5",
    clubId: "club-5",
    departmentId: null,
    title: "Lessons From Our First Hackathon",
    content: "Running our club's first 48-hour hackathon taught us more about logistics than about code — which, in hindsight, is probably true for most first-time organizers.\n\nWhat went well: registration and team formation. We built a simple sign-up form and a Discord bot that auto-matched solo hackers into teams by interest tags, and it worked better than expected — almost nobody stayed teamless past the first two hours. Food logistics also went smoothly once we pre-ordered based on RSVP counts instead of guessing.\n\nWhat broke: our Wi-Fi. Forty extra devices on the Computer Science Building's guest network brought it to a crawl by hour six, and several teams lost work mid-push to GitHub. We hadn't coordinated with IT far enough in advance to get a dedicated network, which is now the very first item on our checklist for next year. We also underestimated how many power strips a room full of laptops actually needs — we ran out by the first evening.\n\nWhat we'd do differently: build in a mandatory midpoint check-in with every team, not just the ones who asked for mentor help. A few teams scoped projects that were never going to be finishable in the time given, and an earlier nudge could have saved them from an all-nighter spent on something that got cut at 3 a.m. anyway.\n\nNone of this is groundbreaking advice, but it's the kind you only really learn by running the thing once.",
    authorId: "user-clubhead-5",
    tags: ["hackathon", "coding"],
    thumbnailUrl: null,
    publishedAt: "2026-04-25T10:00:00Z",
  },
  {
    id: "blog-6",
    clubId: "club-6",
    departmentId: null,
    title: "Prepping for the Winter Showcase",
    content: "Eight weeks sounds like plenty of time to put together a showcase until you're actually in week one and realize half your routines exist only as phone videos of last year's seniors demonstrating moves nobody's re-learned yet.\n\nWeeks one through three were pure rebuilding — breaking down old choreography, adapting it for a mostly new lineup, and figuring out which transitions just didn't work with this year's group's strengths. We scrapped an entire contemporary piece in week two because it was choreographed around a dancer who graduated, and trying to force it onto someone else just wasn't landing.\n\nCostume fittings turned out to be the unexpected bottleneck. We'd budgeted one week for them and needed closer to three, mostly because our first supplier couldn't match the fabric we needed in the right color, and we had to source a backup with barely a month to spare. Lesson learned: order costumes the moment choreography is locked, not after.\n\nBy week six we were doing full run-throughs, and that's when the real polish happens — spacing gets tightened, formations that looked fine in a small studio get reworked for the actual stage size, and the group starts moving like one unit instead of eight individuals counting in their heads. The last two weeks were just repetition, which sounds boring but is honestly where a performance goes from good to sharp.\n\nWinter Showcase is always our biggest night of the semester, and every year it comes together in roughly the same chaotic, last-minute way. We wouldn't have it any other way.",
    authorId: "user-clubhead-6",
    tags: ["dance", "event"],
    thumbnailUrl: null,
    publishedAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "blog-7",
    clubId: "club-7",
    departmentId: null,
    title: "5 Lessons From Our First Pitch Night",
    content: "Our first Pitch Night put twelve student teams in front of a panel of faculty judges and about eighty of their peers. A few patterns showed up across almost every pitch, good and bad, worth writing down for whoever presents next semester.\n\n1. Lead with the problem, not the product. The pitches that opened with a specific, relatable pain point — not a feature list — held the room's attention from the first thirty seconds. The ones that opened with \"our app does X, Y, and Z\" lost people almost immediately.\n\n2. Judges care more about traction than polish. A rough prototype with five real users beat a beautifully designed mockup with zero. One team's entire pitch was built around a spreadsheet of actual signups they'd gathered by hand — it was the least visually impressive deck of the night and it won.\n\n3. Know your numbers cold. Every team got asked at least one question about market size, pricing, or unit economics. Teams that hesitated or guessed lost credibility fast, even if the rest of the pitch was strong.\n\n4. Practice the Q&A, not just the pitch. The best-prepared teams had clearly run mock Q&A sessions beforehand — their answers were tight and confident instead of improvised on the spot.\n\n5. Time yourself out loud, not in your head. Almost every team that went over their five-minute limit had never actually rehearsed with a timer, and it showed — the ending got rushed and the strongest point of the pitch got cut short.\n\nNext semester's cohort already has this list. Hopefully it saves them a few of the mistakes we made in front of a full room.",
    authorId: "user-clubhead-7",
    tags: ["startups", "entrepreneurship"],
    thumbnailUrl: null,
    publishedAt: "2026-05-05T10:00:00Z",
  },
];

// ---------- club creation requests ----------

export interface MockClubRequestRecord {
  id: string;
  clubName: string;
  description: string;
  facultyDetails: string;
  reason: string;
  requestedBy: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export const mockClubRequestsDb: MockClubRequestRecord[] = [
  {
    id: "req-1",
    clubName: "Chess Club",
    description: "Weekly casual and rated chess play, open to all skill levels.",
    facultyDetails: "Dr. Sanjay Mehta, Dept. of Mathematics, has agreed to advise.",
    reason: "There's no dedicated chess community on campus despite steady interest.",
    requestedBy: "user-unaffiliated",
    status: "PENDING",
    reviewedBy: null,
    rejectionReason: null,
    createdAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "req-2",
    clubName: "Debate Society",
    description: "Competitive and casual debate practice and inter-college tournaments.",
    facultyDetails: "Dr. Leela Krishnan, Dept. of English, has agreed to advise.",
    reason: "Several students want to compete in the regional debate circuit.",
    requestedBy: "user-member",
    status: "APPROVED",
    reviewedBy: "user-admin",
    rejectionReason: null,
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "req-3",
    clubName: "Anime Club",
    description: "Weekly screenings and discussion.",
    facultyDetails: "No faculty advisor secured yet.",
    reason: "General interest club.",
    requestedBy: "user-member-2",
    status: "REJECTED",
    reviewedBy: "user-admin",
    rejectionReason: "Duplicate of an existing club.",
    createdAt: "2026-05-10T10:00:00Z",
  },
];

// ---------- announcements ----------

export interface MockAnnouncementRecord {
  id: string;
  title: string;
  content: string;
  visibility: AnnouncementVisibility;
  clubId: string | null;
  departmentId: string | null;
  createdBy: string;
  createdAt: string;
}

export const mockAnnouncementsDb: MockAnnouncementRecord[] = [
  {
    id: "announce-1",
    title: "Welcome to CampusOS",
    content: "This platform is now live for all campus clubs. Explore the directory to get started.",
    visibility: "GLOBAL",
    clubId: null,
    departmentId: null,
    createdBy: "user-admin",
    createdAt: "2026-06-01T09:00:00Z",
  },
  {
    id: "announce-2",
    title: "Robotics Club Recruitment Open",
    content: "We're recruiting new members for the fall competition season. Reach out if interested.",
    visibility: "CLUB",
    clubId: "club-1",
    departmentId: null,
    createdBy: "user-clubhead",
    createdAt: "2026-06-05T09:00:00Z",
  },
  {
    id: "announce-3",
    title: "Web Dev Sprint This Weekend",
    content: "Web Dev department members: bring your laptops, we're sprinting on the Campus Nav App.",
    visibility: "DEPARTMENT",
    clubId: "club-1",
    departmentId: "dept-1",
    createdBy: "user-clubhead",
    createdAt: "2026-06-10T09:00:00Z",
  },
];

// ---------- caller resolution ----------
// Mirrors what the real JWT middleware would resolve server-side. Every mock module reads the
// caller through this instead of trusting anything passed in from the component layer.

export function getMockCallerId(): string | null {
  const token = getToken();
  if (!token?.startsWith("mock.")) return null;
  return token.split(".")[1] ?? null;
}

export function getMockCaller(): MockUserRecord | null {
  const id = getMockCallerId();
  return id ? (mockUsersDb.find((u) => u.id === id) ?? null) : null;
}

export function isClubHeadAnywhere(userId: string): boolean {
  return mockClubMembershipsDb.some((m) => m.userId === userId && m.role === "CLUB_HEAD");
}

// ---------- joins ----------

export function getClubMembershipsForUser(userId: string) {
  return mockClubMembershipsDb
    .filter((m) => m.userId === userId)
    .map((m) => {
      const club = mockClubsDb.find((c) => c.id === m.clubId)!;
      const deptMembership = mockDepartmentMembershipsDb.find(
        (dm) =>
          dm.userId === userId &&
          mockDepartmentsDb.find((d) => d.id === dm.departmentId)?.clubId === m.clubId,
      );
      const dept = deptMembership ? mockDepartmentsDb.find((d) => d.id === deptMembership.departmentId) : undefined;
      return {
        clubId: m.clubId,
        clubName: club.name,
        role: m.role,
        department: dept ? { id: dept.id, name: dept.name } : null,
      };
    });
}
