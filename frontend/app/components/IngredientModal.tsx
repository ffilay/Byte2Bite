import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Button, Modal, Form } from "react-bootstrap";
import { ingredientsService, Ingredient } from '../../services/ingredientService'

type Props = {
    show: boolean; // controlled by parent
    onClose: () => void; // parent callback to close
    ingredientToEdit?: Ingredient;
    onSave: (ingredient: Ingredient) => void;
  };
  
  export default function IngredientModal({ show, onClose, ingredientToEdit, onSave }: Props) {
    const [newIngredient, setNewIngredient] = useState<Ingredient>({
        id: 0,
        name: "",
        unit: "",
        cost_Per_Case: 0,
        cost_Per_Unit: 0,
        current_Stock: 0,
        max_Stock: 0,
        low_Stock_Threshold: 0,
    });

    useEffect(() => {
        if (ingredientToEdit) {
            setNewIngredient(ingredientToEdit);
        }
        else {
            setNewIngredient({
                id: 0,
                name: "",
                unit: "",
                cost_Per_Case: 0,
                cost_Per_Unit: 0,
                current_Stock: 0,
                max_Stock: 0,
                low_Stock_Threshold: 0,
            });
        }
    }, [ingredientToEdit, show]);

    const handleSave = async () => {
        try {
            let savedIngredient: Ingredient;
            if (ingredientToEdit) {
                savedIngredient = await ingredientsService.updateIngredient(newIngredient.id, newIngredient);
            } else {
                savedIngredient = await ingredientsService.addIngredient(newIngredient);
            }

            onSave(savedIngredient); 
            onClose(); 
        
        } catch (err) {
            console.error("Error creating ingredient:", err);
            alert("Failed to create ingredient. Check console for details.");
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                  <Modal.Title>{ingredientToEdit ? "Edit Ingredient" : "Add Ingredient"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Group className="mb-2">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={newIngredient.name}
                        onChange={(e) =>
                          setNewIngredient({ ...newIngredient, name: e.target.value })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Unit</Form.Label>
                      <Form.Control
                        type="text"
                        value={newIngredient.unit}
                        onChange={(e) =>
                          setNewIngredient({ ...newIngredient, unit: e.target.value })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Cost per Case</Form.Label>
                      <Form.Control
                        type="number"
                        value={newIngredient.cost_Per_Case}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            cost_Per_Case: parseFloat(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Cost per Case</Form.Label>
                      <Form.Control
                        type="number"
                        value={newIngredient.cost_Per_Unit}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            cost_Per_Unit: parseFloat(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Cost per Case</Form.Label>
                      <Form.Control
                        type="number"
                        value={newIngredient.current_Stock}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            current_Stock: parseFloat(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Cost per Case</Form.Label>
                      <Form.Control
                        type="number"
                        value={newIngredient.max_Stock}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            max_Stock: parseFloat(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Label>Cost per Case</Form.Label>
                      <Form.Control
                        type="number"
                        value={newIngredient.low_Stock_Threshold}
                        onChange={(e) =>
                          setNewIngredient({
                            ...newIngredient,
                            low_Stock_Threshold: parseFloat(e.target.value),
                          })
                        }
                      />
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={handleSave}>
                    Save
                  </Button>
                </Modal.Footer>
              </Modal>
  );
}

