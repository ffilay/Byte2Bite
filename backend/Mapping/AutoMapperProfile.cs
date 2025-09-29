using AutoMapper;
using BYTE2BITE.Dtos;
using BYTE2BITE.Models;

namespace BYTE2BITE.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Map IngredientDto -> Ingredient
            CreateMap<IngredientDto, Ingredient>();

            // Map ItemDto -> Item
            CreateMap<ItemDto, Item>();

            // Map DistributorDto -> Distributor
            CreateMap<DistributorDto, Distributor>();
        }
    }
}