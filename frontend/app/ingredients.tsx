import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  InputGroup,
  Placeholder,
  Row,
  Spinner,
  Stack,
} from "react-bootstrap";
import { ingredientsService, Ingredient } from "@/services/ingredientService";
import IngredientTable, { getStockStatus, StockStatus } from "./components/IngredientTable";
import IngredientModal from './components/IngredientModal';

type StockFilter = "all" | StockStatus;

const STOCK_FILTER_OPTIONS: { key: StockFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "low", label: "Low Stock" },
  { key: "warning", label: "Warning" },
  { key: "healthy", label: "Healthy" },
];

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        const data = await ingredientsService.getAllIngredients();
        console.log("Fetched ingredients:", data);
        setIngredients(data);
      }
      catch (err){
        console.error("Error fetching ingredients:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const handleSaveIngredient = (savedIngredient: Ingredient) => {
    setIngredients((prev) => {
      const exists = prev.find((i) => i.id === savedIngredient.id);
      if (exists) {
        // Update existing ingredient
        return prev.map((i) => i.id === savedIngredient.id ? savedIngredient : i);
      } else {
        // Add new ingredient
        return [...prev, savedIngredient];
      }
    });
  };
  
  const handleEdit = (ingredient: Ingredient) => {
    setIngredientToEdit(ingredient);
    setShowModal(true);
  };

  const handleAdd = () => {
    setIngredientToEdit(undefined);
    setShowModal(true);
  };

  // delete handler
  const deleteIngredient = async (id: number) => {
    try {
      await ingredientsService.deleteIngredient(id);
      console.log(`Deleted ingredient ${id}`);
      // refresh list after deletion
      setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    } catch (err) {
      console.error("Error deleting ingredient:", err);
    }
  };

  const clearSearch = () => setSearchTerm("");

  const handleStockFilterChange = (nextFilter: StockFilter) => {
    setStockFilter(nextFilter);
  };

  const filteredIngredients = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return ingredients.filter((ingredient) => {
      const matchesSearch =
        !term ||
        [
          ingredient.name,
          ingredient.unit,
          ingredient.cost_Per_Case,
          ingredient.cost_Per_Unit,
          ingredient.current_Stock,
          ingredient.low_Stock_Threshold,
          ingredient.max_Stock,
        ].some((value) => String(value).toLowerCase().includes(term));

      const status = getStockStatus(ingredient);
      const matchesStock = stockFilter === "all" || status === stockFilter;

      return matchesSearch && matchesStock;
    });
  }, [ingredients, searchTerm, stockFilter]);

  const stockCounts = useMemo(() => {
    return ingredients.reduce(
      (acc, ingredient) => {
        acc.all += 1;
        const status = getStockStatus(ingredient);
        acc[status] += 1;
        return acc;
      },
      {
        all: 0,
        low: 0,
        warning: 0,
        healthy: 0,
      } as Record<StockFilter, number>
    );
  }, [ingredients]);

  const summaryCards: { title: string; value: number; variant: "danger" | "warning" | "success" | "secondary" }[] = [
    { title: "Total Ingredients", value: stockCounts.all, variant: "secondary" },
    { title: "Low Stock", value: stockCounts.low, variant: "danger" },
    { title: "Warning Zone", value: stockCounts.warning, variant: "warning" },
    { title: "Healthy Stock", value: stockCounts.healthy, variant: "success" },
  ];

  return (
    <div className="container mt-4">
      <Stack gap={4}>
        <div>
          <h1 className="display-6 fw-bold mb-0">Ingredient Inventory</h1>
          <p className="text-muted mb-0">Track stock, costs, and reorder readiness at a glance.</p>
        </div>

        <Row className="g-3">
          {summaryCards.map((card) => (
            <Col key={card.title} xs={12} md={6} xl={3}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <Card.Title className="text-muted text-uppercase fs-6 mb-1">
                        {card.title}
                      </Card.Title>
                      <Card.Text className="fs-2 fw-semibold mb-0">
                        {isLoading ? (
                          <Placeholder as="span" animation="wave">
                            <Placeholder xs={4} />
                          </Placeholder>
                        ) : (
                          card.value
                        )}
                      </Card.Text>
                    </div>
                    <Badge bg={card.variant} pill>
                      {card.variant === "secondary" ? "All" : card.title.split(" ")[0]}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col xs={12} md="auto">
                <Button variant="primary" onClick={handleAdd} className="w-100">
                  Add Ingredient
                </Button>
              </Col>
              <Col>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    placeholder="Search by name, unit, cost, or stock..."
                    onChange={(event) => setSearchTerm(event.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={clearSearch}
                    disabled={!searchTerm || isLoading}
                    aria-label="Clear search"
                  >
                    Clear
                  </Button>
                </InputGroup>
              </Col>
            </Row>

            <div className="d-flex flex-wrap gap-2 mt-3" role="group" aria-label="Stock filters">
              <ButtonGroup>
                {STOCK_FILTER_OPTIONS.map((option) => (
                  <Button
                    key={option.key}
                    variant={stockFilter === option.key ? "primary" : "outline-secondary"}
                    onClick={() => handleStockFilterChange(option.key)}
                    disabled={isLoading}
                  >
                    {option.label}
                    <Badge
                      bg="transparent"
                      text={stockFilter === option.key ? "light" : "secondary"}
                      className="ms-2 border rounded-pill"
                    >
                      {isLoading ? "..." : stockCounts[option.key]}
                    </Badge>
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Body>
            {isLoading ? (
              <div className="py-5 text-center text-muted">
                <Spinner animation="border" role="status" />
                <p className="mt-3 mb-0">Loading ingredients...</p>
              </div>
            ) : filteredIngredients.length === 0 ? (
              <div className="py-5 text-center text-muted">
                <p className="mb-0">No ingredients match your current filters.</p>
              </div>
            ) : (
              <IngredientTable
                ingredients={filteredIngredients}
                onEdit={handleEdit}
                onDelete={deleteIngredient}
              />
            )}
          </Card.Body>
        </Card>
      </Stack>

      <IngredientModal
        show={showModal}
        onClose={() => setShowModal(false)}
        ingredientToEdit={ingredientToEdit}
        onSave={handleSaveIngredient}
      />
    </div>
  );
}
