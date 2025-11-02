import { Button } from "react-bootstrap";
import MenuTable from "./components/MenuTable";
import { Items, menuService } from "@/services/menuService";
import { useEffect, useState } from "react";

export default function IngredientsPage() {
  const [Items, setItems] = useState<Items[]>([]);

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

  console.log("Menu items:", Items);

  return (
    <div className="container mt-4">
      <h3 className="mt-4">Menu Inventory:</h3>
      <MenuTable menuItem={Items} />
    </div>
  );
}
