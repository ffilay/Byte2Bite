import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { ingredientsService, Ingredient } from "@/services/ingredientService";
import IngredientTable from "./components/IngredientTable";
import IngredientModal from './components/IngredientModal';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | undefined>();

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const data = await ingredientsService.getAllIngredients();
        console.log("Fetched ingredients:", data);
        setIngredients(data);
      }
      catch (err){
        console.error("Error fetching ingredients:", err);
      }
    };
    fetchIngredients();
  }, []);

  const handleSaveIngredient = (savedIngredient: Ingredient) => {
    setIngredients((prev) => {
      const exists = prev.find((i) => i.id === savedIngredient.id);
      if (exists) {
        // Update existing ingredient
        return prev.map((i) => i.id === savedIngredient.id ? savedIngredient : i);
      } else {
        // Add new ingredient
        return [...prev, savedIngredient];
      }
    });
  };
  
  const handleEdit = (ingredient: Ingredient) => {
    setIngredientToEdit(ingredient);
    setShowModal(true);
  };

  const handleAdd = () => {
    setIngredientToEdit(undefined);
    setShowModal(true);
  };

  // delete handler
  const deleteIngredient = async (id: number) => {
    try {
      await ingredientsService.deleteIngredient(id);
      console.log(`Deleted ingredient ${id}`);
      // refresh list after deletion
      setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    } catch (err) {
      console.error("Error deleting ingredient:", err);
    }
};

  return (
    <div className="container mt-4">
      <Button className="btn btn-primary" onClick={handleAdd}>
        Add Ingredient
      </Button>
      <IngredientModal show={showModal}
        onClose={() => setShowModal(false)}
        ingredientToEdit={ingredientToEdit}
        onSave={handleSaveIngredient}/>
      <h3 className="mt-4">Ingredient Inventory:</h3>
      <IngredientTable ingredients={ingredients} onEdit={handleEdit} onDelete={deleteIngredient}/>
      </div>
  );
}