// services/menuService.ts
export interface Items {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  //restaurantID?
}

const API_URL = "http://localhost:5038/api";

async function importMenuItems(
  restaurantId: number
): Promise<{ upserted: number }> {
  const res = await fetch(
    `${API_URL}/menu/import?restaurantId=${restaurantId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to import menu items");
  }

  return res.json(); // returns { upserted: <number> }
}

async function getAllMenuItems(): Promise<Items[]> {
  const res = await fetch(`${API_URL}/items`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch menu items");
  return res.json();
}

export const menuService = {
  importMenuItems,
  getAllMenuItems,
};
