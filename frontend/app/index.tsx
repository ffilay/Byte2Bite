import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  ScrollView,
} from "react-native";
import { supabase } from "../services/supabaseClient";
import { useRouter } from "expo-router";
import { menuService, Items } from "../services/menuService";
import {
  ingredientsService,
  Ingredient,
} from "../services/ingredientService";
import {
  fetchTransactions,
  Transaction,
} from "../services/transactionService"; //NEW

const UNCATEGORIZED_LABEL = "Uncategorized";

type StockStatus = "low" | "warning" | "healthy";

function getStockStatus(ingredient: Ingredient): StockStatus {
  const current = ingredient.current_Stock ?? 0;
  const lowThreshold = ingredient.low_Stock_Threshold ?? 0;
  const maxStock = ingredient.max_Stock ?? 0;

  if (current <= lowThreshold) return "low";
  if (maxStock > 0 && current < maxStock) return "warning";
  return "healthy";
}

export default function HomeScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // auth

  // MENU
  const [items, setItems] = useState<Items[]>([]);
  // INGREDIENTS
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  // TRANSACTIONS
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // ===== AUTH =====
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error.message);
          setUserEmail(null);
          return;
        }

        if (data.session?.user?.email) {
          setUserEmail(data.session.user.email);
        } else {
          setUserEmail(null);
        }

        if (data.session?.user?.user_metadata?.display_name) {
          setUserName(data.session.user.user_metadata.display_name);
        } else {
          setUserName(null);
        }
      } catch (err) {
        console.error("Unexpected error loading session:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        } else {
          setUserEmail(null);
        }

        if (session?.user?.user_metadata?.display_name) {
          setUserName(session.user.user_metadata.display_name);
        } else {
          setUserName(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ===== DASHBOARD DATA (menu + ingredients + transactions) =====
  useEffect(() => {
    if (!userEmail) {
      setDashboardLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        setDashboardError(null);

        // fetch menu, ingredients, and transactions in parallel
        const [menuData, ingredientData, transactionData] = await Promise.all([
          menuService.getAllMenuItems(),
          ingredientsService.getAllIngredients(),
          fetchTransactions(100),
        ]);

        setItems(menuData);
        setIngredients(ingredientData);
        setTransactions(transactionData);
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setDashboardError("Failed to load dashboard data.");
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [userEmail]);

  // ===== MENU METRICS =====
  const categoryCounts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      const key = item.category?.trim() || UNCATEGORIZED_LABEL;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const averagePrice = useMemo(() => {
    if (!items.length) return null;
    const total = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    return total / items.length;
  }, [items]);

  const topPrice = useMemo(() => {
    if (!items.length) return null;
    return Math.max(...items.map((item) => item.price ?? 0));
  }, [items]);

  const formatCurrency = (value: number | null) => {
    if (value === null) return "--";
    return `$${value.toFixed(2)}`;
  };

  // ===== INGREDIENT METRICS =====
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
      } as {
        all: number;
        low: number;
        warning: number;
        healthy: number;
      }
    );
  }, [ingredients]);

  // TRANSACTION METRICS
  const totalTransactions = transactions.length;

  const totalRevenue = useMemo(() => {
    if (!transactions.length) return null;
    const cents = transactions.reduce(
      (sum, t) => sum + (t.total_money_cents ?? 0),
      0
    );
    return cents / 100; // convert to dollars
  }, [transactions]);

  const revenueCurrency = useMemo(() => {
    // just grab currency from first transaction, or default
    return transactions[0]?.currency ?? "USD";
  }, [transactions]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserEmail(null);
      router.replace("/login");
    } catch (err: any) {
      console.error("Logout failed:", err.message);
    }
  };

  // ===== AUTH STATES =====
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Loading user info...</Text>
      </View>
    );
  }

  if (!userEmail) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Not logged in</Text>
        <Button title="Go to Login" onPress={() => router.replace("/login")} />
      </View>
    );
  }

  // ===== MAIN DASHBOARD =====
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollInner}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome, {userName ?? userEmail}!</Text>
        <Text style={styles.subtitle}>
          Here&apos;s a quick snapshot of your menu, inventory & sales.
        </Text>
      </View>

      {/* Row 1: Menu metrics */}
      <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 0 }}>
  Menu
</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Menu Items</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.cardValue}>{items.length}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Active Categories</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.cardValue}>
              {Object.keys(categoryCounts).length}
            </Text>
          )}
          
        </View>
        
      </View>
       {/* Row 4: Menu pricing metrics */}
       <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Average Price</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.cardValue}>
              {formatCurrency(averagePrice)}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Top Price</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.cardValue}>{formatCurrency(topPrice)}</Text>
          )}
        </View>
      </View>

      {/* Row 2: Ingredient core metrics */}
      <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 20 }}>
  Ingredients
</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Ingredients</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.cardValue}>{stockCounts.all}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Low Stock</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={[styles.cardValue, { color: "#b91c1c" }]}>
              {stockCounts.low}
            </Text>
          )}
        </View>
      </View>

      {/* Row 3: Ingredient health breakdown */}
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Warning Stock</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={[styles.cardValue, { color: "#d97706" }]}>
              {stockCounts.warning}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Healthy Stock</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={[styles.cardValue, { color: "#15803d" }]}>
              {stockCounts.healthy}
            </Text>
          )}
        </View>
      </View>

      {/* Row 5: Transaction / sales metrics */}
      <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 20 }}>
  Transactions
</Text>
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Transactions</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.cardValue}>{totalTransactions}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Revenue</Text>
          {dashboardLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.cardValue}>
              {totalRevenue === null
                ? "--"
                : `${revenueCurrency} ${totalRevenue.toFixed(2)}`}
            </Text>
          )}
        </View>
      </View>

      {dashboardError && (
        <Text style={styles.errorText}>{dashboardError}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  scrollInner: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    color: "#6b7280",
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  errorText: {
    marginTop: 12,
    color: "red",
  },
  logoutContainer: {
    marginTop: 24,
    alignSelf: "flex-start",
  },
});
