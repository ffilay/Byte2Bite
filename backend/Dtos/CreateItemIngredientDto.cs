using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class CreateItemIngredientDto
    {
        [Required]
        public int IngredientId { get; set; }

        [Required]
        public float Quantity { get; set; }
    }
}
