using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("profiles")]
    public class UserProfile : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }
        [Column("supabase_id")]
        public Guid supabaseId { get; set; } = Guid.NewGuid();

        [Column("full_name")]
        public string? FullName { get; set; }

        [Column("created_at")]
        public DateTime CreatedOn { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("restaurant_id")]
        public int Restaurant_Id { get; set; }
    }
}
