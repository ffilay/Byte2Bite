import { View, Text, Button, Modal, TextInput, TouchableOpacity, FlatList } from "react-native";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { ingredientsService, Ingredient } from "@/services/ingredientService";
import IngredientTable from "./IngredientTable";

export default function IngredientsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

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

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Ingredients
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button title="Add Ingredient" onPress={() => console.log("Add works")}/>
        <Button title="Update Ingredient" onPress={() => console.log("Update works")}/>
        <Button title="Delete Ingredient" onPress={() => console.log("Delete works")}/>
      </View>
      <Text style={{ fontSize: 18, fontWeight: "bold", margin: 20 }}>
        Ingredient Inventory:
      </Text>
      <IngredientTable/>
    </View>
  );
}