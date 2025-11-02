import "bootstrap/dist/css/bootstrap.min.css";
import { useMemo, useState } from "react";
import { Items } from "../../services/menuService";

type Props = {
  menuItem: Items[];
  onEdit: (item: Items) => void;
};

export default function MenuTable({ menuItem, onEdit }: Props) {
  type SortKey = "name" | "price" | "category" | "description";

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null;
    });
  };

  const sortedItems = useMemo(() => {
    if (!sortConfig) {
      return menuItem;
    }

    const sorted = [...menuItem];

    sorted.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      const directionMultiplier = sortConfig.direction === "asc" ? 1 : -1;

      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * directionMultiplier;
      }

      return (
        String(valueA ?? "").localeCompare(String(valueB ?? ""), undefined, {
          sensitivity: "base",
        }) * directionMultiplier
      );
    });

    return sorted;
  }, [menuItem, sortConfig]);

  const getAriaSort = (key: SortKey): "ascending" | "descending" | "none" => {
    if (sortConfig?.key !== key) {
      return "none";
    }

    return sortConfig.direction === "asc" ? "ascending" : "descending";
  };

  const renderSortIndicator = (key: SortKey) => {
    if (sortConfig?.key !== key) {
      return " \u2195";
    }

    return sortConfig.direction === "asc" ? " \u2191" : " \u2193";
  };

  const getSortButtonClass = (key: SortKey) => {
    const base = "btn btn-link w-100 text-start p-0 text-decoration-none";
    const isActive = sortConfig?.key === key && sortConfig.direction;
    return `${base} ${isActive ? "text-warning fw-semibold" : "text-white"}`;
  };

    return (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <colgroup>
              <col style={{ width: "24%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead className="table-dark">
              <tr>
                <th
                  scope="col"
                  aria-sort={getAriaSort("name")}
                >
                  <button
                    type="button"
                    className={getSortButtonClass("name")}
                    onClick={() => handleSort("name")}
                  >
                    Item{renderSortIndicator("name")}
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={getAriaSort("price")}
                >
                  <button
                    type="button"
                    className={getSortButtonClass("price")}
                    onClick={() => handleSort("price")}
                  >
                    Price{renderSortIndicator("price")}
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={getAriaSort("category")}
                >
                  <button
                    type="button"
                    className={getSortButtonClass("category")}
                    onClick={() => handleSort("category")}
                  >
                    Category{renderSortIndicator("category")}
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={getAriaSort("description")}
                >
                  <button
                    type="button"
                    className={getSortButtonClass("description")}
                    onClick={() => handleSort("description")}
                  >
                    Description{renderSortIndicator("description")}
                  </button>
                </th>
                <th scope="col" className="text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
          {sortedItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name} </td>
              <td>{item.price} </td>
              <td>{item.category}</td>
              <td>{item.description}</td>
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
};
