using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace BYTE2BITE.Models
{
    [Table("ingredients2items")]
    public class Ingredients2Items : BaseModel
    {
        [Column("item_id")]
        public int Item_Id { get; set; }

        [Column("ingredient_id")]
        public int Ingredient_Id { get; set; }

        [Column("ingredient_quantity")]
        public float Ingredient_Quantity { get; set; }

        public Item? Item { get; set; }

        public Ingredient? Ingredient { get; set; }
    }
}
