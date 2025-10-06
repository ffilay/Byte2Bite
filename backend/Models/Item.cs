using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

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

        public Restaurant? Restaurant { get; set; }
    }
}
