import { Button } from "react-bootstrap";
import MenuTable from "./components/MenuTable";
import { MenuItem, menuService } from "@/services/menuService";
import { useEffect, useState } from "react";

export default function IngredientsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenuItems= async () => {
      try {
        const data = await menuService.getAllMenuItems();
        console.log("Fetched menu items:", data);
        setMenuItems(data);
      }
      catch (err){
        console.error("Error fetching menu items:", err);
      }
    };
    fetchMenuItems();
  }, []);

  return (
  <div className="container mt-4">
  <Button className="btn btn-primary me-3" onClick={() => {}}>
    Add Menu Item
  </Button>
  <h3 className="mt-4">Menu Inventory:</h3>
      <MenuTable menuItem={menuItems}/>
  </div>
  );
}