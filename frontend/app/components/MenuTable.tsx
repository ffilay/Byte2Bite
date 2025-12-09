import "bootstrap/dist/css/bootstrap.min.css";
import { useMemo, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { Items } from "../../services/menuService";

type Props = {
  menuItem: Items[];
  onEdit: (item: Items) => void;
};

type SortKey = "name" | "price" | "totalCost" | "profitMargin" | "category" | "description";

type SortConfig = {
  key: SortKey;
  direction: "asc" | "desc";
};

export default function MenuTable({ menuItem, onEdit }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig) {
      return menuItem;
    }

    const { key, direction } = sortConfig;
    const directionMultiplier = direction === "asc" ? 1 : -1;

    const getValue = (item: Items) => {
      if (key === "totalCost") return item.totalCost ?? 0;
      if (key === "profitMargin") return item.profitMargin ?? Number.NEGATIVE_INFINITY;
      return (item as any)[key];
    };

    return [...menuItem].sort((a, b) => {
      const valueA = getValue(a);
      const valueB = getValue(b);

      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * directionMultiplier;
      }

      return (
        String(valueA ?? "").localeCompare(String(valueB ?? ""), undefined, {
          sensitivity: "base",
        }) * directionMultiplier
      );
    });
  }, [menuItem, sortConfig]);

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

  const getAriaSort = (key: SortKey): "ascending" | "descending" | "none" => {
    if (sortConfig?.key !== key) {
      return "none";
    }

    return sortConfig.direction === "asc" ? "ascending" : "descending";
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <colgroup>
          <col style={{ width: "18%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "18%" }} />
        </colgroup>
        <thead className="bg-light text-secondary">
          <tr>
            <th
              scope="col"
              onClick={() => handleSort("name")}
              style={{ cursor: "pointer", userSelect: "none" }}
              aria-sort={getAriaSort("name")}
            >
              <span className="d-inline-flex align-items-center">
                Item
                {sortIndicator("name")}
              </span>
            </th>
            <th
              scope="col"
              onClick={() => handleSort("price")}
              style={{ cursor: "pointer", userSelect: "none" }}
              aria-sort={getAriaSort("price")}
            >
              <span className="d-inline-flex align-items-center">
                Price
                {sortIndicator("price")}
              </span>
            </th>
            <th
              scope="col"
              onClick={() => handleSort("totalCost")}
              style={{ cursor: "pointer", userSelect: "none" }}
              aria-sort={getAriaSort("totalCost")}
            >
              <span className="d-inline-flex align-items-center">
                Total Cost
                {sortIndicator("totalCost")}
              </span>
            </th>
            <th
              scope="col"
              onClick={() => handleSort("profitMargin")}
              style={{ cursor: "pointer", userSelect: "none" }}
              aria-sort={getAriaSort("profitMargin")}
            >
              <span className="d-inline-flex align-items-center">
                Profit Margin
                {sortIndicator("profitMargin")}
              </span>
            </th>
            <th
              scope="col"
              onClick={() => handleSort("category")}
              style={{ cursor: "pointer", userSelect: "none" }}
              aria-sort={getAriaSort("category")}
            >
              <span className="d-inline-flex align-items-center">
                Category
                {sortIndicator("category")}
              </span>
            </th>
            <th
              scope="col"
              onClick={() => handleSort("description")}
              style={{ cursor: "pointer", userSelect: "none" }}
              aria-sort={getAriaSort("description")}
            >
              <span className="d-inline-flex align-items-center">
                Description
                {sortIndicator("description")}
              </span>
            </th>
            <th scope="col" className="text-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td>{item.totalCost ?? "—"}</td>
              <td>
                {typeof item.profitMargin === "number"
                  ? `${(item.profitMargin * 100).toFixed(1)}%`
                  : "—"}
              </td>
              <td>{item.category || "Uncategorized"}</td>
              <td className="text-muted">{item.description || "—"}</td>
              <td className="text-center">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
