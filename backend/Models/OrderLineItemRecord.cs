using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("order_line_items")]
    public class OrderLineItemRecord : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("order_id")]
        public long Order_Id { get; set; }

        [Column("square_line_item_uid")]
        public string Square_Line_Item_Uid { get; set; } = string.Empty;

        [Column("square_catalog_object_id")]
        public string? Square_Catalog_Object_Id { get; set; }

        [Column("item_id")]
        public int? Item_Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("quantity")]
        public decimal Quantity { get; set; }

        [Column("base_price_cents")]
        public long? Base_Price_Cents { get; set; }

        [Column("total_money_cents")]
        public long? Total_Money_Cents { get; set; }
    }
}
