using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("orders")]
    public class OrderRecord : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("restaurant_id")]
        public int Restaurant_Id { get; set; }

        [Column("square_order_id")]
        public string Square_Order_Id { get; set; } = string.Empty;

        [Column("state")]
        public string State { get; set; } = string.Empty;

        [Column("total_money_cents")]
        public long Total_Money_Cents { get; set; }

        [Column("currency")]
        public string Currency { get; set; } = "USD";

        [Column("location_id")]
        public string? Location_Id { get; set; }

        [Column("customer_id")]
        public string? Customer_Id { get; set; }

        [Column("square_created_at")]
        public DateTimeOffset? Square_Created_At { get; set; }

        [Column("square_updated_at")]
        public DateTimeOffset? Square_Updated_At { get; set; }

        [Column("version")]
        public long? Version { get; set; }
    }
}
