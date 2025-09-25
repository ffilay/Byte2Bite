import { View, Text, Button, Modal, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function IngredientsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");

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
            </View>
  );
}