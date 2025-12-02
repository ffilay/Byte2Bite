namespace backend.Dtos
{
    public record ItemIngredientDto(
        int IngredientId,
        float Quantity,
        string? IngredientName,
        string? Unit
    );
}
