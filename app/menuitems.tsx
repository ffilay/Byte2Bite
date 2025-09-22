import { View, Text, Button, Modal, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";

export default function IngredientsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState("");

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Menu Items
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Button title="Add Menu Item" onPress={() => console.log("Add works")}/>
        <Button title="Update Menu Item" onPress={() => console.log("Update works")}/>
        <Button title="Delete Menu Item" onPress={() => console.log("Delete works")}/>
      </View>
            </View>
  );
}