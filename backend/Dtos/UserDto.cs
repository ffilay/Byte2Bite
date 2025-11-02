using System.ComponentModel.DataAnnotations;
using backend.Models;

namespace backend.Dtos
{
    public class UserDto
    {
        [Required]
        public int Id { get; set; } 

        [Required]
        public Guid supabaseId { get; set; } = Guid.NewGuid();

        [Required]
        public string? FullName { get; set; }

        [Required]
        public DateTime CreatedOn { get; set; }

        [Required]
        public string? Email { get; set; }

        [Required]
        public int Restaurant_Id { get; set; }

    }
}
