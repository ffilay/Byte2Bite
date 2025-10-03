using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class DistributorDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Phone { get; set; } = null!;

        [Required]
        public string Email { get; set; } = null!;
    }
}
