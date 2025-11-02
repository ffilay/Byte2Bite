import "bootstrap/dist/css/bootstrap.min.css";
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
import { Items, menuService } from "@/services/menuService";
import MenuItemModal from "./components/MenuItemModal";
import MenuTable from "./components/MenuTable";

type CategoryFilter = "all" | string;

const UNCATEGORIZED_LABEL = "Uncategorized";

export default function MenuItemsPage() {
  const [items, setItems] = useState<Items[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedItem, setSelectedItem] = useState<Items | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const importSquareCatalog = async () => {
      try {
        await menuService.importMenuItems(1 /* hardcoded to sandbox for now */);
      } catch (err) {
        console.error("Error importing square catalog:", err);
      }
    };
    importSquareCatalog();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const data = await menuService.getAllMenuItems();
        console.log("Fetched menu items:", data);
        setItems(data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const normalizedTerm = searchTerm.trim().toLowerCase();

  const categoryCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      const key = item.category?.trim() || UNCATEGORIZED_LABEL;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const categoryOptions = useMemo(() => {
    const categories = Object.keys(categoryCounts).sort((a, b) =>
      a.localeCompare(b)
    );

    return [
      {
        key: "all" as CategoryFilter,
        label: "All Categories",
        count: items.length,
      },
      ...categories.map((category) => ({
        key: category,
        label: category,
        count: categoryCounts[category] ?? 0,
      })),
    ];
  }, [categoryCounts, items.length]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !normalizedTerm ||
        item.name?.toLowerCase().includes(normalizedTerm) ||
        item.category?.toLowerCase().includes(normalizedTerm) ||
        item.description?.toLowerCase().includes(normalizedTerm);

      const categoryKey = item.category?.trim() || UNCATEGORIZED_LABEL;
      const matchesCategory =
        categoryFilter === "all" || categoryKey === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [items, normalizedTerm, categoryFilter]);

  const averagePrice = useMemo(() => {
    if (!items.length) {
      return null;
    }

    const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    return total / items.length;
  }, [items]);

  const topPrice = useMemo(() => {
    if (!items.length) {
      return null;
    }

    return Math.max(...items.map((item) => item.price ?? 0));
  }, [items]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }),
    []
  );

  const summaryCards = [
    {
      title: "Menu Items",
      value: items.length,
      variant: "secondary" as const,
    },
    {
      title: "Active Categories",
      value: Object.keys(categoryCounts).length,
      variant: "info" as const,
    },
    {
      title: "Average Price",
      value: averagePrice !== null ? currencyFormatter.format(averagePrice) : "--",
      variant: "success" as const,
    },
    {
      title: "Top Price",
      value: topPrice !== null ? currencyFormatter.format(topPrice) : "--",
      variant: "warning" as const,
    },
  ];

  const handleEditItem = (item: Items) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="container mt-4">
      <Stack gap={4}>
        <div>
          <h1 className="display-6 fw-bold mb-0">Menu Inventory</h1>
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
                      {card.variant === "secondary"
                        ? "All"
                        : card.title.split(" ")[0]}
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
              <Col>
                <InputGroup>
                  <Form.Control
                    type="search"
                    value={searchTerm}
                    placeholder="Search by item, category, or description..."
                    onChange={(event) => setSearchTerm(event.target.value)}
                    disabled={isLoading}
                    aria-label="Search menu items"
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

            <div className="d-flex flex-wrap gap-2 mt-3" role="group" aria-label="Category filters">
              <ButtonGroup>
                {categoryOptions.map((option) => (
                  <Button
                    key={option.key}
                    variant={categoryFilter === option.key ? "primary" : "outline-secondary"}
                    onClick={() => setCategoryFilter(option.key)}
                    disabled={isLoading}
                  >
                    {option.label}
                    <Badge
                      bg="transparent"
                      text={categoryFilter === option.key ? "light" : "secondary"}
                      className="ms-2 border rounded-pill"
                    >
                      {isLoading ? "..." : option.count}
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
                <p className="mt-3 mb-0">Loading menu items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-5 text-center text-muted">
                <p className="mb-0">
                  No menu items match your current filters.
                </p>
              </div>
            ) : (
              <MenuTable menuItem={filteredItems} onEdit={handleEditItem} />
            )}
          </Card.Body>
        </Card>
      </Stack>

      <MenuItemModal
        show={showModal}
        onClose={handleCloseModal}
        menuItem={selectedItem ?? undefined}
      />
    </div>
  );
}
