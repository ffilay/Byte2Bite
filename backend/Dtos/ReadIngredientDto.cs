namespace backend.Dtos
{
    public record ReadIngredientDto(
        int Id,
        string Name,
        string Unit,
        float Cost_Per_Case,
        float Cost_Per_Unit,
        float Current_Stock,
        float Max_Stock,
        float Low_Stock_Threshold
    );
}
