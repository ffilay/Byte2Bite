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
        public decimal Cost_Per_Case { get; set; }

        [Required]
        public decimal Cost_Per_Unit { get; set; }

        [Required]
        public decimal Current_Stock { get; set; }

        [Required]
        public decimal Max_Stock { get; set; }

        [Required]
        public decimal Low_Stock_Threshold { get; set; }
    }
}
