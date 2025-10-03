using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class WriteIngredientDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Unit { get; set; } = null!;

        [Required]
        public float Cost_Per_Case { get; set; }

        [Required]
        public float Cost_Per_Unit { get; set; }

        [Required]
        public float Current_Stock { get; set; }

        [Required]
        public float Max_Stock { get; set; }

        [Required]
        public float Low_Stock_Threshold { get; set; }
    }
}
