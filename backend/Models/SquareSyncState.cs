using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace backend.Models
{
    [Table("square_sync_state")]
    public class SquareSyncState : BaseModel
    {
        [PrimaryKey("restaurant_id")]
        [Column("restaurant_id")]
        public int Restaurant_Id { get; set; }

        [Column("last_success_at")]
        public DateTimeOffset? Last_Success_At { get; set; }
    }
}
