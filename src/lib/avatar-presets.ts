export interface AvatarPreset {
  id: string;
  gender: "Male" | "Female";
  url: string;
}

// A small, self-hosted set of illustrated avatars (public/avatars/*.svg) —
// stands in for a real photo-upload pipeline, which this app doesn't have.
export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "male-1", gender: "Male", url: "/avatars/male-1.svg" },
  { id: "male-2", gender: "Male", url: "/avatars/male-2.svg" },
  { id: "male-3", gender: "Male", url: "/avatars/male-3.svg" },
  { id: "male-4", gender: "Male", url: "/avatars/male-4.svg" },
  { id: "female-1", gender: "Female", url: "/avatars/female-1.svg" },
  { id: "female-2", gender: "Female", url: "/avatars/female-2.svg" },
  { id: "female-3", gender: "Female", url: "/avatars/female-3.svg" },
  { id: "female-4", gender: "Female", url: "/avatars/female-4.svg" },
];
