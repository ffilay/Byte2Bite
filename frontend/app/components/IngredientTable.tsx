import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from "react";
import { BsTrash, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Ingredient } from '../../services/ingredientService';

type Props = {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: number) => void;
};

export type StockStatus = "low" | "warning" | "healthy";

export const getStockStatus = (item: Ingredient): StockStatus => {
  const current = item.current_Stock;
  const low = item.low_Stock_Threshold;
  const max = item.max_Stock;

  if (current <= low) return "low";

  const warningThreshold = low + 0.25 * Math.max(max - low, 0);
  if (current <= warningThreshold) return "warning";

  return "healthy";
};

type SortKey = keyof Pick<
  Ingredient,
  | "name"
  | "unit"
  | "cost_Per_Case"
  | "cost_Per_Unit"
  | "current_Stock"
  | "low_Stock_Threshold"
  | "max_Stock"
>;

type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
};

export default function IngredientTable({ ingredients, onEdit, onDelete }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    if (confirmingId === null) return;
    const exists = ingredients.some((item) => item.id === confirmingId);
    if (!exists) {
      setConfirmingId(null);
    }
  }, [ingredients, confirmingId]);

  const requestDelete = (id: number) => setConfirmingId(id);
  const confirmDelete = (id: number) => {
    onDelete(id);
    setConfirmingId(null);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }

      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  const sortedIngredients = useMemo(() => {
    if (!sortConfig) {
      return ingredients;
    }

    const { key, direction } = sortConfig;
    const sorted = [...ingredients].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }

      const stringA = String(valueA).toLowerCase();
      const stringB = String(valueB).toLowerCase();

      if (stringA < stringB) return direction === "asc" ? -1 : 1;
      if (stringA > stringB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [ingredients, sortConfig]);

  const sortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="ms-2 text-muted">↕</span>;
    }

    return sortConfig.direction === "asc" ? (
      <BsChevronUp className="ms-2" />
    ) : (
      <BsChevronDown className="ms-2" />
    );
  };

  const stockClass = (item: Ingredient) => {
    const status = getStockStatus(item);
    if (status === "low") return 'table-danger'; // RED background
    if (status === "warning") return 'table-warning'; // YELLOW background
    return 'table-success'; // GREEN background
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
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
        <thead className="bg-light text-secondary">
          <tr>
            <th scope="col" onClick={() => handleSort("name")} style={{ cursor: "pointer", userSelect: "none" }}>
              <span className="d-inline-flex align-items-center">
                Ingredient
                {sortIndicator("name")}
              </span>
            </th>
            <th scope="col" onClick={() => handleSort("unit")} style={{ cursor: "pointer", userSelect: "none" }}>
              <span className="d-inline-flex align-items-center">
                Unit
                {sortIndicator("unit")}
              </span>
            </th>
            <th scope="col" onClick={() => handleSort("cost_Per_Case")} style={{ cursor: "pointer", userSelect: "none" }}>
              <span className="d-inline-flex align-items-center">
                Case Cost
                {sortIndicator("cost_Per_Case")}
              </span>
            </th>
            <th scope="col" onClick={() => handleSort("cost_Per_Unit")} style={{ cursor: "pointer", userSelect: "none" }}>
              <span className="d-inline-flex align-items-center">
                Unit Cost
                {sortIndicator("cost_Per_Unit")}
              </span>
            </th>
            <th scope="col" onClick={() => handleSort("current_Stock")} style={{ cursor: "pointer", userSelect: "none" }}>
              <span className="d-inline-flex align-items-center">
                Current Stock
                {sortIndicator("current_Stock")}
              </span>
            </th>
            <th scope="col" onClick={() => handleSort("low_Stock_Threshold")} style={{ cursor: "pointer", userSelect: "none" }}>
              <span className="d-inline-flex align-items-center">
                Low Stock Threshold
                {sortIndicator("low_Stock_Threshold")}
              </span>
            </th>
            <th scope="col" onClick={() => handleSort("max_Stock")} style={{ cursor: "pointer", userSelect: "none" }}>
              <span className="d-inline-flex align-items-center">
                Max Stock
                {sortIndicator("max_Stock")}
              </span>
            </th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {sortedIngredients.map((item) => (
            <tr key={item.id}>
              <td>{item.name} </td>
              <td>{item.unit} </td>
              <td>{item.cost_Per_Case}</td>
              <td>{item.cost_Per_Unit}</td>
              <td className={stockClass(item)}>{item.current_Stock}</td>
              <td>{item.low_Stock_Threshold}</td>
              <td>{item.max_Stock}</td>
              <td><button className='btn btn-outline-primary' onClick={() => onEdit(item)}>Edit</button></td>
              <td>
                <button
                  type="button"
                  className={`btn d-inline-flex align-items-center justify-content-center ${
                    confirmingId === item.id ? "btn-danger text-white border-white" : "btn-outline-secondary"
                  }`}
                  aria-label={confirmingId === item.id ? "Confirm delete ingredient" : "Delete ingredient"}
                  onClick={() =>
                    confirmingId === item.id ? confirmDelete(item.id) : requestDelete(item.id)
                  }
                  style={{ width: 44, height: 40 }}
                  onBlur={() => {
                    if (confirmingId === item.id) {
                      setConfirmingId(null);
                    }
                  }}
                >
                  <BsTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

