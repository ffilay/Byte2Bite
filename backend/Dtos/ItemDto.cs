using System.ComponentModel.DataAnnotations;

namespace BYTE2BITE.Dtos
{
    public class ItemDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public float Price { get; set; }

        [Required]
        public string Category { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;
    }
}
