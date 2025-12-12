using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Newtonsoft.Json;

namespace backend.Models
{
    [Table("ingredients2items")]
    public class Ingredients2Items : BaseModel
    {
        // Table PK is item_id; ingredient_id is a FK (supabase needs the PK annotated)
        [PrimaryKey("item_id", true)]
        public int Item_Id { get; set; }

        [Column("ingredient_id")]
        public int Ingredient_Id { get; set; }

        [Column("ingredient_quantity")]
        public float Ingredient_Quantity { get; set; }

        [JsonIgnore]
        public Item? Item { get; set; }

        [JsonIgnore]
        public Ingredient? Ingredient { get; set; }
    }
}
