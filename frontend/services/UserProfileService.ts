import { User } from "@supabase/supabase-js";

// services/UserProfilesService.ts 
export interface UserProfile {
  id: number;
  supabaseId: string;        
  fullName: string;
  createdOn: string;         
  email: string;
  restaurant_Id: number;  
}

const API_URL = "http://localhost:5038/api/users";

async function getAllUsers(): Promise<UserProfile[]> {
  const res = await fetch(API_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch Users");
  return res.json();
}

async function getUserProfile(id: number): Promise<UserProfile> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`UserProfile ${id} not found`);
  return res.json();
}

async function addUserProfile(userDto: UserProfile): Promise<UserProfile> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userDto),
  });

  if (!res.ok) {
    const errorText = await res.text(); // 👈 log what server actually said
    console.error("AddUserProfile failed:", res.status, errorText);
    throw new Error("Failed to add UserProfile");
  }

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
  getAllUsers,
  getUserProfile,
  addUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
