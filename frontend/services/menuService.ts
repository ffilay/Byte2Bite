// services/menuService.ts
export interface Items {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  totalCost?: number;
  profitMargin?: number;
  //restaurantID?
}

export interface ItemIngredientLink {
  ingredientId: number;
  quantity: number;
  ingredientName?: string;
  unit?: string;
}

const API_URL = "http://localhost:5038/api";
const ITEMS_API = `${API_URL}/items`;

const parseItemIngredient = (payload: any): ItemIngredientLink => {
  const ingredientId =
    payload?.IngredientId ??
    payload?.ingredientId ??
    payload?.ingredient_id ??
    payload?.ingredient?.id ??
    payload?.id;

  const quantity =
    payload?.Quantity ??
    payload?.quantity ??
    payload?.ingredient_quantity ??
    payload?.ingredientQuantity ??
    payload?.ingredient_quantity;

  const ingredientName =
    payload?.IngredientName ??
    payload?.ingredientName ??
    payload?.ingredient_name ??
    payload?.ingredient?.name;

  const unit = payload?.Unit ?? payload?.unit ?? payload?.ingredient?.unit;

  return {
    ingredientId: Number(ingredientId ?? 0),
    quantity: Number(quantity ?? 0),
    ingredientName,
    unit,
  };
};

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

async function getItemIngredients(
  itemId: number
): Promise<ItemIngredientLink[]> {
  const res = await fetch(`${ITEMS_API}/${itemId}/ingredients`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch item ingredients");
  const data = await res.json();
  return Array.isArray(data) ? data.map(parseItemIngredient) : [];
}

async function addItemIngredient(
  itemId: number,
  payload: { ingredientId: number; quantity: number }
): Promise<ItemIngredientLink> {
  const res = await fetch(`${ITEMS_API}/${itemId}/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add ingredient to item");
  return parseItemIngredient(await res.json());
}

async function updateItemIngredient(
  itemId: number,
  ingredientId: number,
  payload: { quantity: number }
): Promise<ItemIngredientLink> {
  const res = await fetch(`${ITEMS_API}/${itemId}/ingredients/${ingredientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update ingredient quantity");
  return parseItemIngredient(await res.json());
}

async function deleteItemIngredient(itemId: number, ingredientId: number) {
  const res = await fetch(`${ITEMS_API}/${itemId}/ingredients/${ingredientId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to remove ingredient from item");
}

export const menuService = {
  importMenuItems,
  getAllMenuItems,
  getItemIngredients,
  addItemIngredient,
  updateItemIngredient,
  deleteItemIngredient,
};
