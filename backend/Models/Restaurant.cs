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
        public string Name { get; set; } = null!;

        [Column("zip")]
        public string ZipCode { get; set; } = null!;

        [Column("square_merchant_id")]
        public string SquareId { get; set; } = null!;

        [Column("square_access_token")]
        public string SquareAccessToken { get; set; } = null!;

    }
}
