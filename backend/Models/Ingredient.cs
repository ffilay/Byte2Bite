using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("ingredients")]
    public class Ingredient : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("unit")]
        public string? Unit { get; set; }

        [Column("cost_per_case")]
        public float Cost_Per_Case { get; set; }

        [Column("cost_per_unit")]
        public float Cost_Per_Unit { get; set; }

        [Column("current_stock")]
        public float Current_Stock { get; set; }

        [Column("max_stock")]
        public float Max_Stock { get; set; }

        [Column("low_stock_threshold")]
        public float Low_Stock_Threshold { get; set; }
    }
}
