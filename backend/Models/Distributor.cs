using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace BYTE2BITE.Models
{
    [Table("distributors")]
    public class Distributor : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("name")]
        public string? Name { get; set; }

        [Column("phone")]
        public string? Phone { get; set; }

        [Column("email")]
        public string? Email { get; set; }
    }
}
