export type UserStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";
export type Occupation = "school" | "college" | "job" | "other";

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  age: number;
  occupation: Occupation;
  occupationDetail: string;
  qualifications: string;
  skills: string;
  status: UserStatus;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
  approvedAt: number | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export const OCCUPATION_LABELS: Record<Occupation, string> = {
  school: "School",
  college: "College",
  job: "Job",
  other: "Other",
};
