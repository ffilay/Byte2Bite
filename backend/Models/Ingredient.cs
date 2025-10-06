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
        public decimal Cost_Per_Case { get; set; }

        [Column("cost_per_unit")]
        public decimal Cost_Per_Unit { get; set; }

        [Column("current_stock")]
        public decimal Current_Stock { get; set; }

        [Column("max_stock")]
        public decimal Max_Stock { get; set; }

        [Column("low_stock_threshold")]
        public decimal Low_Stock_Threshold { get; set; }

        [Column("distributor_id")]
        public int DistributorID { get; set; }
        public Distributor? Distributor { get; set; }
    }
}
