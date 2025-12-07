using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Newtonsoft.Json;

namespace backend.Models
{
    [Table("items")]
    public class Item : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("price")]
        public float Price { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("restaurant_id")]
        public int Restaurant_Id { get; set; }

        [JsonIgnore]
        public Restaurant? Restaurant { get; set; }

        // Square identifiers and variation support
        [Column("square_item_id")]
        public string? Square_Item_Id { get; set; }

        [Column("square_variation_id")]
        public string? Square_Variation_Id { get; set; }

        [Column("variation_name")]
        public string? Variation_Name { get; set; }

        [Column("total_cost")]
        public decimal? Total_Cost { get; set; }

        [Column("profit_margin")]
        public decimal? Profit_Margin { get; set; }
    }
}
