using ProductCatalog.Models;

namespace ProductCatalog.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Products.Any())
            {
                return; // DB ya tiene datos
            }

            var products = new Product[]
            {
                new Product{Name="Laptop", Description="Laptop de última generación", Price=1200.99m, Stock=15},
                new Product{Name="Smartphone", Description="Teléfono inteligente con cámara de 48MP", Price=699.50m, Stock=30},
                new Product{Name="Tablet", Description="Tablet de 10 pulgadas con stylus", Price=349.99m, Stock=20},
                new Product{Name="Auriculares", Description="Auriculares inalámbricos con cancelación de ruido", Price=199.99m, Stock=45},
                new Product{Name="Smartwatch", Description="Reloj inteligente con monitor de frecuencia cardíaca", Price=249.99m, Stock=25}
            };

            foreach (var p in products)
            {
                context.Products.Add(p);
            }

            context.SaveChanges();
        }
    }
}