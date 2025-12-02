import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import {
  Items,
  ItemIngredientLink,
  menuService,
} from "../../services/menuService";
import {
  ingredientsService,
  Ingredient,
} from "../../services/ingredientService";

type Props = {
  show: boolean;
  onClose: () => void;
  menuItem?: Items;
};

export default function MenuItemModal({ show, onClose, menuItem }: Props) {
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [itemIngredients, setItemIngredients] = useState<ItemIngredientLink[]>([]);
  const [addForm, setAddForm] = useState({ ingredientId: "", quantity: "1" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = menuItem?.name ? `Edit ${menuItem.name}` : "Edit Menu Item";

  const resetFormState = () => {
    setAvailableIngredients([]);
    setItemIngredients([]);
    setAddForm({ ingredientId: "", quantity: "1" });
    setEditingId(null);
    setEditQuantity("1");
    setError(null);
    setIsMutating(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!show || !menuItem?.id) {
      resetFormState();
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [ingredients, linked] = await Promise.all([
          ingredientsService.getAllIngredients(),
          menuService.getItemIngredients(menuItem.id),
        ]);
        setAvailableIngredients(ingredients);
        setItemIngredients(linked);

        const nextDefault = ingredients.find(
          (ing) => !linked.some((link) => link.ingredientId === ing.id)
        );
        setAddForm({
          ingredientId: nextDefault ? String(nextDefault.id) : "",
          quantity: "1",
        });
      } catch (err: any) {
        const message = err?.message || "Failed to load menu item ingredients.";
        setError(message);
        console.error(message, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [show, menuItem?.id]);

  const availableOptions = useMemo(() => {
    return availableIngredients.filter(
      (ing) => !itemIngredients.some((link) => link.ingredientId === ing.id)
    );
  }, [availableIngredients, itemIngredients]);

  const selectedAddUnit = useMemo(() => {
    const selected = availableIngredients.find(
      (ing) => ing.id === Number(addForm.ingredientId)
    );
    return selected?.unit || "";
  }, [addForm.ingredientId, availableIngredients]);

  const resolveIngredientMeta = (link: ItemIngredientLink) => {
    const fallback = availableIngredients.find((ing) => ing.id === link.ingredientId);
    return {
      name: link.ingredientName || fallback?.name || `Ingredient #${link.ingredientId}`,
      unit: link.unit || fallback?.unit || "",
    };
  };

  const handleAddIngredient = async () => {
    if (!menuItem?.id) return;

    const ingredientId = Number(addForm.ingredientId);
    const quantity = Number(addForm.quantity);

    if (!ingredientId) {
      setError("Select an ingredient to add.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      setIsMutating(true);
      setError(null);
      const created = await menuService.addItemIngredient(menuItem.id, {
        ingredientId,
        quantity,
      });
      setItemIngredients((prev) => [...prev, created]);
      const nextDefault = availableOptions.find(
        (ing) => ing.id !== ingredientId
      );
      setAddForm({
        ingredientId: nextDefault ? String(nextDefault.id) : "",
        quantity: "1",
      });
    } catch (err: any) {
      const message = err?.message || "Failed to add ingredient.";
      setError(message);
      console.error(message, err);
    } finally {
      setIsMutating(false);
    }
  };

  const startEditQuantity = (link: ItemIngredientLink) => {
    setEditingId(link.ingredientId);
    setEditQuantity(String(link.quantity));
    setError(null);
  };

  const handleUpdateQuantity = async () => {
    if (!menuItem?.id || editingId === null) return;
    const quantity = Number(editQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      setIsMutating(true);
      setError(null);
      const updated = await menuService.updateItemIngredient(
        menuItem.id,
        editingId,
        { quantity }
      );
      setItemIngredients((prev) =>
        prev.map((link) =>
          link.ingredientId === editingId ? { ...link, ...updated } : link
        )
      );
      setEditingId(null);
    } catch (err: any) {
      const message = err?.message || "Failed to update quantity.";
      setError(message);
      console.error(message, err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleRemoveIngredient = async (ingredientId: number) => {
    if (!menuItem?.id) return;
    try {
      setIsMutating(true);
      setError(null);
      await menuService.deleteItemIngredient(menuItem.id, ingredientId);
      setItemIngredients((prev) =>
        prev.filter((link) => link.ingredientId !== ingredientId)
      );
      if (editingId === ingredientId) {
        setEditingId(null);
      }
    } catch (err: any) {
      const message = err?.message || "Failed to remove ingredient.";
      setError(message);
      console.error(message, err);
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="py-4 text-center text-muted">
            <Spinner animation="border" role="status" />
            <p className="mt-3 mb-0">Loading ingredients...</p>
          </div>
        ) : (
          <Stack gap={3}>
            <div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <div className="text-uppercase text-muted small fw-semibold">
                    Assigned Ingredients
                  </div>
                  <div className="text-muted small">
                    Manage the ingredients tied to this menu item and set required quantities.
                  </div>
                </div>
                <Badge bg="secondary">{itemIngredients.length} linked</Badge>
              </div>

              {itemIngredients.length === 0 ? (
                <div className="border rounded p-3 text-muted text-center">
                  No ingredients linked yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Name</th>
                        <th style={{ width: "20%" }}>Quantity</th>
                        <th style={{ width: "20%" }} className="text-end">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemIngredients.map((link) => {
                        const meta = resolveIngredientMeta(link);
                        const isEditing = editingId === link.ingredientId;
                        return (
                          <tr key={link.ingredientId}>
                            <td>
                              <div className="fw-semibold">{meta.name}</div>
                              {meta.unit ? (
                                <div className="text-muted small">Unit: {meta.unit}</div>
                              ) : null}
                            </td>
                            <td>
                              {isEditing ? (
                                <InputGroup size="sm">
                                  <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editQuantity}
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    disabled={isMutating}
                                    aria-label="Ingredient quantity"
                                  />
                                  {meta.unit ? (
                                    <InputGroup.Text>{meta.unit}</InputGroup.Text>
                                  ) : null}
                                </InputGroup>
                              ) : (
                                <span className="fw-semibold">
                                  {link.quantity}
                                  {meta.unit ? (
                                    <span className="text-muted ms-1">{meta.unit}</span>
                                  ) : null}
                                </span>
                              )}
                            </td>
                            <td className="text-end">
                              {isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="success"
                                    className="me-2"
                                    onClick={handleUpdateQuantity}
                                    disabled={isMutating}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => setEditingId(null)}
                                    disabled={isMutating}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => startEditQuantity(link)}
                                    disabled={isMutating}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleRemoveIngredient(link.ingredientId)}
                                    disabled={isMutating}
                                  >
                                    Remove
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-top pt-3">
              <div className="text-uppercase text-muted small fw-semibold mb-2">
                Add Ingredient
              </div>
              <Row className="g-2 align-items-end">
                <Col md={6}>
                  <Form.Label className="mb-1">Ingredient</Form.Label>
                  <Form.Select
                    value={addForm.ingredientId}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, ingredientId: e.target.value }))
                    }
                    disabled={isMutating || availableOptions.length === 0}
                  >
                    <option value="" disabled>
                      {availableOptions.length === 0
                        ? "All ingredients are already linked"
                        : "Select an ingredient"}
                    </option>
                    {availableOptions.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label className="mb-1">Quantity</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={addForm.quantity}
                      onChange={(e) =>
                        setAddForm((prev) => ({ ...prev, quantity: e.target.value }))
                      }
                      disabled={isMutating}
                      aria-label="Quantity to add"
                    />
                    {selectedAddUnit ? <InputGroup.Text>{selectedAddUnit}</InputGroup.Text> : null}
                  </InputGroup>
                </Col>
                <Col md={2} className="d-grid">
                  <Button
                    variant="primary"
                    onClick={handleAddIngredient}
                    disabled={
                      isMutating ||
                      !addForm.ingredientId ||
                      !Number.isFinite(Number(addForm.quantity))
                    }
                  >
                    Add
                  </Button>
                </Col>
              </Row>
            </div>
          </Stack>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
