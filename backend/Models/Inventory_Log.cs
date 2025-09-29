using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace BYTE2BITE.Models
{
    [Table("inventory_log")]
    public class Inventory_Log : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("ingredient_id")]
        public int Ingredient_Id { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("quantity_used")]
        public float Quantity_Used { get; set; }

        public Ingredient? Ingredient { get; set; }
    }
}
