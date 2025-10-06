import 'bootstrap/dist/css/bootstrap.min.css';
import { ingredientsService, Ingredient } from "@/services/ingredientService";

interface Props {
    ingredients: Ingredient[];
}
const IngredientTable: React.FC<Props> = ({ ingredients }) => {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IngredientTable;
