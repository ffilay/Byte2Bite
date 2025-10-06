using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("profiles")]
    public class Profile : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("full_name")]
        public string? FullName { get; set; }

        [Column("created_at")]
        public DateOnly CreatedOn { get; set; }

        [Column("phone")]
        public string Phone { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("restaurant_id")]
        public int Restaurant_Id { get; set; }

        public Restaurant? Restaurant { get; set; }

    }
}
