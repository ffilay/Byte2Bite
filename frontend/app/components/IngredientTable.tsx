import 'bootstrap/dist/css/bootstrap.min.css';
import { BsTrash } from "react-icons/bs";
import { ingredientsService, Ingredient } from '../../services/ingredientService'

type Props = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: number) => void;
};

export default function IngredientTable({ ingredients, onEdit, onDelete }: Props) {
  const stockClass = (item: Ingredient) => {
    const current = item.current_Stock;
    const low = item.low_Stock_Threshold;
    const max = item.max_Stock;
    if (current <= low) return 'table-danger'; // RED background
    if (current <= low + 0.25 * (max - low)) return 'table-warning'; // YELLOW background
    return 'table-success'; // GREEN background
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <colgroup>  
          <col style={{ width: '24%' }} /> 
          <col style={{ width: '8%' }} /> 
          <col style={{ width: '10%' }} /> 
          <col style={{ width: '10%' }} /> 
          <col style={{ width: '12%' }} /> 
          <col style={{ width: '12%' }} /> 
          <col style={{ width: '12%' }} /> 
          <col style={{ width: 80 }} /> 
          <col style={{ width: 60 }} />
        </colgroup>
        <thead className="table-dark">
          <tr>
            <th scope="col">Ingredient</th>
            <th scope="col">Unit</th>
            <th scope="col">Case Cost</th>
            <th scope="col">Unit Cost</th>
            <th scope="col">Current Stock</th>
            <th scope="col">Low Stock Threshold</th>
            <th scope="col">Max Stock</th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((item) => (
            <tr key={item.id}>
              <td>{item.name} </td>
              <td>{item.unit} </td>
              <td>{item.cost_Per_Case}</td>
              <td>{item.cost_Per_Unit}</td>
              <td className={stockClass(item)}>{item.current_Stock}</td>
              <td>{item.low_Stock_Threshold}</td>
              <td>{item.max_Stock}</td>
              <td><button className='btn btn-outline-primary' onClick={() => onEdit(item)}>Edit</button></td>
              <td><button className='btn btn-outline-primary' onClick={() => onDelete(item.id)}><BsTrash/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

