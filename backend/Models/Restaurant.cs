using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("restaurants")]
    public class Restaurant : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("price")]
        public float Price { get; set; }

        [Column("zip")]
        public int ZipCode { get; set; }

        [Column("square_merchant_id")]
        public int? SquareId { get; set; }

        [Column("square_access_token")]
        public string? SquareAccessToken { get; set; }

    }
}
