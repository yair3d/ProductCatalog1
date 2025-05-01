using ProductCatalog.DTOs;

namespace ProductCatalog.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDTO>> GetAllProductsAsync();
        Task<ProductDTO> GetProductByIdAsync(int id);
        Task<ProductDTO> CreateProductAsync(ProductCreateDTO productCreateDTO);
        Task UpdateProductAsync(int id, ProductCreateDTO productCreateDTO);
        Task DeleteProductAsync(int id);
        Task<bool> ProductExistsAsync(int id);
    }
}