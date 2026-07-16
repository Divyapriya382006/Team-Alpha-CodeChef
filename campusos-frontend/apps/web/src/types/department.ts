export interface Department {
  id: string;
  clubId: string;
  name: string;
  headUserId: string | null;
  createdAt: string;
}

export interface DepartmentMember {
  userId: string;
  name: string;
}

// GET /departments/:id — Department + members[].
export interface DepartmentDetail extends Department {
  members: DepartmentMember[];
}
