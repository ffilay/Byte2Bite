// services/UserProfilesService.ts
export interface UserProfile {
  id: number;
  supabaseId: string | undefined;
  name: string;
  date: string | undefined;
  restaurantId: number;
  email: string | undefined;
}

const API_URL = "http://localhost:5038/api/users";

async function getUserProfile(id: number): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`UserProfile ${id} not found`);
  return res.json();
}

async function addUserProfile(UserProfile: UserProfile): Promise<UserProfile> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(UserProfile),
  });
  if (!res.ok) throw new Error("Failed to add UserProfile");
  return res.json();
}

async function updateUserProfile(
  id: number,
  UserProfile: UserProfile
): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(UserProfile),
  });
  if (!res.ok) throw new Error("Failed to update UserProfile");
  return res.json();
}

async function deleteUserProfile(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete UserProfile ${id}`);
}

export const UserProfilesService = {
  getUserProfile,
  addUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
