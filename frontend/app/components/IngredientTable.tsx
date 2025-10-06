import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { BsTrash } from "react-icons/bs";
import { ingredientsService, Ingredient } from '../../services/ingredientService'

export default function IngredientTable() {

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    // fetch all
    const loadIngredients = async () => {
        const data = await ingredientsService.getAllIngredients();
        setIngredients(data);
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

    useEffect(() => {
        loadIngredients();
    }, []);

    return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead className="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Ingredient (Unit)</th>
            <th scope="col">Case Cost</th>
            <th scope="col">Unit Cost</th>
            <th scope="col">Current Stock</th>
            <th scope="col">Low Stock Threshold</th>
            <th scope="col">Max Stock</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name} ({item.unit})</td>
              <td>{item.cost_Per_Case}</td>
              <td>{item.cost_Per_Unit}</td>
              <td>{item.current_Stock}</td>
              <td>{item.low_Stock_Threshold}</td>
              <td>{item.max_Stock}</td>
              <td><button className='btn btn-outline-primary' onClick={() => deleteIngredient(item.id)}><BsTrash/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

