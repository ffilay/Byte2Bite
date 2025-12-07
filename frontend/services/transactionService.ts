export interface TransactionLineItem {
  line_item_id: number | null;
  name: string;
  quantity: number | null;
  base_price_cents: number | null;
  total_money_cents: number | null;
  item_id: number | null;
}

export interface Transaction {
  order_pk: number;
  square_order_id: string;
  restaurant_id: number;
  state: string;
  total_money_cents: number | null;
  currency: string;
  square_created_at: string | null;
  square_updated_at: string | null;
  line_items: TransactionLineItem[] | null;
}

export interface TransactionSyncState {
  last_success_at: string | null;
}

const toNumberOrNull = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const normalizeLineItems = (items: any): TransactionLineItem[] | null => {
  if (!Array.isArray(items)) return null;
  return items.map((li) => ({
    line_item_id: toNumberOrNull(li.line_item_id ?? li.Line_Item_Id ?? li.id),
    name: li.name ?? li.Name ?? "",
    quantity: toNumberOrNull(li.quantity ?? li.Quantity),
    base_price_cents: toNumberOrNull(li.base_price_cents ?? li.Base_Price_Cents),
    total_money_cents: toNumberOrNull(li.total_money_cents ?? li.Total_Money_Cents),
    item_id: toNumberOrNull(li.item_id ?? li.Item_Id),
  }));
};

export async function fetchTransactions(limit = 50): Promise<Transaction[]> {
  const res = await fetch(`http://localhost:5038/api/transactions?limit=${limit}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch transactions");
  }
  const data = await res.json();
  return (data as any[]).map((t) => ({
    order_pk: Number(t.order_Pk ?? t.order_pk ?? t.Order_Pk ?? t.OrderPk ?? 0),
    square_order_id: t.square_order_id ?? t.Square_Order_Id ?? "",
    restaurant_id: Number(t.restaurant_id ?? t.Restaurant_Id ?? 0),
    state: t.state ?? t.State ?? "",
    total_money_cents: toNumberOrNull(t.total_money_cents ?? t.Total_Money_Cents),
    currency: t.currency ?? t.Currency ?? "USD",
    square_created_at: t.square_created_at ?? t.Square_Created_At ?? null,
    square_updated_at: t.square_updated_at ?? t.Square_Updated_At ?? null,
    line_items: normalizeLineItems(t.line_items ?? t.Line_Items),
  }));
}

export async function fetchTransactionSyncState(): Promise<TransactionSyncState> {
  const res = await fetch("http://localhost:5038/api/transactions/last-sync");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch transaction sync state");
  }
  const data = await res.json();
  return {
    last_success_at: data?.last_success_at ?? null,
  };
}
