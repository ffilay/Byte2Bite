using AutoMapper;
using backend.Dtos;
using backend.Models;

namespace backend.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Map Ingredient <-> ReadIngredientDto
            CreateMap<Ingredient, ReadIngredientDto>().ReverseMap();

            // Map Ingredient <-> WriteIngredientDto
            CreateMap<Ingredient, WriteIngredientDto>().ReverseMap();

            // Map ItemDto -> Item
            CreateMap<Item, ItemDto>().ReverseMap();

            // Map DistributorDto -> Distributor
            CreateMap<DistributorDto, Distributor>();
        }
    }
}