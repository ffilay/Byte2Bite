// services/menuService.ts
export interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    //restaurantID?
  }

    const API_URL = "http://localhost:5038/api/items";

    async function getAllMenuItems(): Promise<MenuItem[]> {
      const res = await fetch(API_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch menu items");
      return res.json();
    }

      export const menuService = {
        getAllMenuItems,
      };