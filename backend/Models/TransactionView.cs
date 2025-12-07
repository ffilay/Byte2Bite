using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("v_transactions")]
    public class TransactionView : BaseModel
    {
        [PrimaryKey("order_pk")]
        public long Order_Pk { get; set; }

        [Column("square_order_id")]
        public string Square_Order_Id { get; set; } = string.Empty;

        [Column("restaurant_id")]
        public int Restaurant_Id { get; set; }

        [Column("state")]
        public string State { get; set; } = string.Empty;

        [Column("total_money_cents")]
        public long Total_Money_Cents { get; set; }

        [Column("currency")]
        public string Currency { get; set; } = "USD";

        [Column("square_created_at")]
        public DateTimeOffset? Square_Created_At { get; set; }

        [Column("square_updated_at")]
        public DateTimeOffset? Square_Updated_At { get; set; }

        // Aggregated JSON array from the view
        [Column("line_items")]
        public Newtonsoft.Json.Linq.JToken? Line_Items { get; set; }
    }
}
