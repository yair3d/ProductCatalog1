using AutoMapper;
using ProductCatalog.DTOs;
using ProductCatalog.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ProductCatalog.Services
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductDTO>();
            CreateMap<ProductCreateDTO, Product>();
            CreateMap<Product, ProductCreateDTO>(); // Para actualizaciones
        }
    }
}