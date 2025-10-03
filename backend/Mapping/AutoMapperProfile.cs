using AutoMapper;
using backend.Dtos;
using backend.Models;

namespace backend.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Map Ingredient -> ReadIngredientDto
            CreateMap<Ingredient, ReadIngredientDto>();

            // Map WriteIngredientDto -> Ingredient
            CreateMap<WriteIngredientDto, Ingredient>();

            // Map ItemDto -> Item
            CreateMap<ItemDto, Item>();

            // Map DistributorDto -> Distributor
            CreateMap<DistributorDto, Distributor>();
        }
    }
}