using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class UpdateItemIngredientDto
    {
        [Required]
        public float Quantity { get; set; }
    }
}
