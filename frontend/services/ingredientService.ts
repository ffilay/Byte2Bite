// services/ingredientsService.ts
export interface Ingredient {
    id: number;
    name: string;
    unit: string;
    cost_Per_Case: number;
    cost_Per_Unit: number;
    current_Stock: number;
    max_Stock: number;
    low_Stock_Threshold: number;
  }
  
  const API_URL = "http://localhost:5038/api/ingredients"; 
  
  async function getAllIngredients(): Promise<Ingredient[]> {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch ingredients");
    return res.json();
  }
  
  async function getIngredient(id: number): Promise<Ingredient> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Ingredient ${id} not found`);
    return res.json();
  }
  
  async function addIngredient(ingredient: Ingredient): Promise<Ingredient> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingredient),
    });
    if (!res.ok) throw new Error("Failed to add ingredient");
    return res.json();
  }
  
  async function updateIngredient(id: number, ingredient: Ingredient): Promise<Ingredient> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingredient),
    });
    if (!res.ok) throw new Error("Failed to update ingredient");
    return res.json();
  }
  
  async function deleteIngredient(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`Failed to delete ingredient ${id}`);
  }
  
  export const ingredientsService = {
    getAllIngredients,
    getIngredient,
    addIngredient,
    updateIngredient,
    deleteIngredient,
  };
  