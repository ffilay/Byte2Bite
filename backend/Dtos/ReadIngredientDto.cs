namespace backend.Dtos
{
    public record ReadIngredientDto(
        int Id,
        string Name,
        string Unit,
        decimal Cost_Per_Case,
        decimal Cost_Per_Unit,
        decimal Current_Stock,
        decimal Max_Stock,
        decimal Low_Stock_Threshold
    );
}
