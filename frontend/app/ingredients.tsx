import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { ingredientsService, Ingredient } from "@/services/ingredientService";
import IngredientTable, { getStockStatus, StockStatus } from "./components/IngredientTable";
import IngredientModal from './components/IngredientModal';

type StockFilter = "all" | StockStatus;

const STOCK_FILTER_OPTIONS: { key: StockFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low Stock" },
  { key: "warning", label: "Warning" },
  { key: "healthy", label: "Healthy" },
];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

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

  const clearSearch = () => setSearchTerm("");

  const handleStockFilterChange = (nextFilter: StockFilter) => {
    setStockFilter(nextFilter);
  };

  const filteredIngredients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return ingredients.filter((ingredient) => {
      const matchesSearch =
        !term ||
        [
          ingredient.name,
          ingredient.unit,
          ingredient.cost_Per_Case,
          ingredient.cost_Per_Unit,
          ingredient.current_Stock,
          ingredient.low_Stock_Threshold,
          ingredient.max_Stock,
        ].some((value) => String(value).toLowerCase().includes(term));

      const status = getStockStatus(ingredient);
      const matchesStock = stockFilter === "all" || status === stockFilter;

      return matchesSearch && matchesStock;
    });
  }, [ingredients, searchTerm, stockFilter]);

  return (
    
    <div className="container mt-4">
      <h3 className="fs-1 fw-semibold">
        Ingredient Inventory
      </h3>
      <br />
      <div className="d-flex flex-column flex-md-row align-items-md-center gap-2">
        <Button className="btn btn-primary" onClick={handleAdd}>
          Add Ingredient
        </Button>
        <div className="flex-grow-1">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Button
              variant="outline-secondary"
              onClick={clearSearch}
              disabled={!searchTerm}
              aria-label="Clear search"
            >
              x
            </Button>
            
            <div className="btn-group ms-2" role="group" aria-label="Stock filters">
              {STOCK_FILTER_OPTIONS.map((option) => (
              <Button
                key={option.key}
                variant={stockFilter === option.key ? "primary" : "outline-secondary"}
                onClick={() => handleStockFilterChange(option.key)}
              >
                {option.label}
              </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3">
        
      </div>
      <IngredientModal show={showModal}
        onClose={() => setShowModal(false)}
        ingredientToEdit={ingredientToEdit}
        onSave={handleSaveIngredient}/>
      <IngredientTable ingredients={filteredIngredients} onEdit={handleEdit} onDelete={deleteIngredient}/>
      </div>
  );
}
