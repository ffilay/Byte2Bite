import MenuItemModal from "./components/MenuItemModal";
import MenuTable from "./components/MenuTable";
import { Items, menuService } from "@/services/menuService";
import { useEffect, useState } from "react";

export default function IngredientsPage() {
  const [items, setItems] = useState<Items[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<Items | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const importSquareCatalog = async () => {
      try {
        const data = await menuService.importMenuItems(
          1 /*hardcoded to sandbox for now*/
        );
      } catch (err) {
        console.error("Error importing square catalog:", err);
      }
    };
    importSquareCatalog();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const data = await menuService.getAllMenuItems();
        console.log("Fetched menu items:", data);
        setItems(data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
      }
    };
    fetchMenuItems();
  }, []);

  console.log("Menu items:", items);

  const normalizedTerm = searchTerm.trim().toLowerCase();
  const filteredItems = normalizedTerm
    ? items.filter(
        (item) =>
          item.name?.toLowerCase().includes(normalizedTerm) ||
          item.category?.toLowerCase().includes(normalizedTerm) ||
          item.description?.toLowerCase().includes(normalizedTerm)
      )
    : items;

  const handleEditItem = (item: Items) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="container mt-4">
      <MenuItemModal
        show={showModal}
        onClose={handleCloseModal}
        menuItem={selectedItem ?? undefined}
      />
      <h3 className="mt-4">Menu Inventory:</h3>
      <div className="row mt-3">
        <div className="col-md-6 col-lg-4">
          <input
            type="search"
            className="form-control"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by item, category, or description"
            aria-label="Search menu items"
          />
        </div>
      </div>
      <MenuTable menuItem={filteredItems} onEdit={handleEditItem} />
    </div>
  );
}
