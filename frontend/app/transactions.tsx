import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { fetchTransactions, Transaction, TransactionLineItem } from "../services/transactionService";

const currencyFormat = (cents: number | null | undefined, currency: string) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return "-";
  const dollars = n / 100;
  return `${currency} ${dollars.toFixed(2)}`;
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions(100);
      setTransactions(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await fetchTransactions(100);
      setTransactions(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load transactions");
    } finally {
      setRefreshing(false);
    }
  };

  const renderLineItem = ({ item }: { item: TransactionLineItem }) => (
    <View style={styles.lineItemRow}>
      <Text style={styles.lineItemName}>{item.name}</Text>
      <Text style={styles.lineItemDetail}>Qty: {item.quantity ?? "-"}</Text>
      <Text style={styles.lineItemDetail}>
        Base: {currencyFormat(item.base_price_cents, "")}
      </Text>
      <Text style={styles.lineItemDetail}>
        Total: {currencyFormat(item.total_money_cents, "")}
      </Text>
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>{item.square_order_id}</Text>
        <Text style={styles.state}>{item.state}</Text>
      </View>
      <Text style={styles.total}>{currencyFormat(item.total_money_cents, item.currency)}</Text>
      <Text style={styles.meta}>
        Created: {item.square_created_at ? new Date(item.square_created_at).toLocaleString() : "n/a"}
      </Text>
      <Text style={styles.meta}>
        Updated: {item.square_updated_at ? new Date(item.square_updated_at).toLocaleString() : "n/a"}
      </Text>
      {item.line_items && item.line_items.length > 0 && (
        <View style={styles.lineItems}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <FlatList
            data={item.line_items}
            keyExtractor={(li) => `${item.order_pk}-${li.line_item_id}`}
            renderItem={renderLineItem}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.meta}>Loading transactions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16 }}
      data={transactions}
      keyExtractor={(item) => String(item.order_pk)}
      renderItem={renderTransaction}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.meta}>No transactions found.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
  },
  state: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  total: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: "#555",
  },
  lineItems: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  lineItemRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  lineItemName: {
    fontSize: 14,
    fontWeight: "600",
  },
  lineItemDetail: {
    fontSize: 12,
    color: "#555",
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
});
