import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { fetchTransactions, fetchTransactionSyncState, Transaction, TransactionLineItem } from "../services/transactionService";

const currencyFormat = (cents: number | null | undefined, currency: string) => {
  const n = Number(cents);
  if (!Number.isFinite(n)) return "-";
  const dollars = n / 100;
  return `${currency} ${dollars.toFixed(2)}`;
};

export default function TransactionsScreen() {
  const PAGE_SIZE = 20;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tx, sync] = await Promise.all([
        fetchTransactions(100),
        fetchTransactionSyncState().catch(() => ({ last_success_at: null })),
      ]);
      setTransactions(tx);
      setLastSync(sync.last_success_at);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [transactions.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [tx, sync] = await Promise.all([
        fetchTransactions(100),
        fetchTransactionSyncState().catch(() => ({ last_success_at: null })),
      ]);
      setTransactions(tx);
      setLastSync(sync.last_success_at);
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

  const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageData = transactions.slice(startIndex, startIndex + PAGE_SIZE);

  const changePage = (nextPage: number) => {
    if (nextPage >= 1 && nextPage <= totalPages) {
      setPage(nextPage);
    }
  };

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
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={pageData}
      keyExtractor={(item) => String(item.order_pk)}
      renderItem={renderTransaction}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.syncHeader}>
          <Text style={styles.syncLabel}>Last Square sync</Text>
          <Text style={styles.syncValue}>
            {lastSync ? new Date(lastSync).toLocaleString() : "Not available"}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.meta}>No transactions found.</Text>
        </View>
      }
      ListFooterComponent={
        transactions.length > 0 ? (
          <View style={styles.pagination}>
            <Text style={styles.meta}>
              Showing {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, transactions.length)} of {transactions.length}
            </Text>
            <View style={styles.paginationButtons}>
              <PageButton label="<<" disabled={currentPage === 1} onPress={() => changePage(1)} />
              <PageButton label="<" disabled={currentPage === 1} onPress={() => changePage(currentPage - 1)} />
              <Text style={styles.meta}>
                {currentPage} / {totalPages}
              </Text>
              <PageButton label=">" disabled={currentPage === totalPages} onPress={() => changePage(currentPage + 1)} />
              <PageButton label=">>" disabled={currentPage === totalPages} onPress={() => changePage(totalPages)} />
            </View>
          </View>
        ) : null
      }
    />
  );
}

const PageButton = ({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={disabled ? undefined : onPress}
    style={[
      styles.pageButton,
      disabled ? styles.pageButtonDisabled : styles.pageButtonEnabled,
    ]}
    accessibilityRole="button"
    accessibilityState={{ disabled }}
  >
    <Text style={[styles.pageButtonText, disabled && styles.pageButtonTextDisabled]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
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
  pagination: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paginationButtons: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  pageButtonEnabled: {
    borderColor: "#0d6efd",
    backgroundColor: "white",
  },
  pageButtonDisabled: {
    borderColor: "#ccc",
    backgroundColor: "#f8f9fa",
  },
  pageButtonText: {
    color: "#0d6efd",
    fontWeight: "600",
  },
  pageButtonTextDisabled: {
    color: "#888",
  },
  syncHeader: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#d5e3ff",
  },
  syncLabel: {
    fontSize: 12,
    color: "#445",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  syncValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2a44",
  },
});
