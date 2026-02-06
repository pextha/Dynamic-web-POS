package com.dynamicpos.service;

import com.dynamicpos.model.Product;
import com.dynamicpos.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        return productRepository.save(java.util.Objects.requireNonNull(product, "Product must not be null"));
    }

    public Product getProduct(Long id) {
        return productRepository.findById(java.util.Objects.requireNonNull(id, "ID must not be null"))
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(java.util.Objects.requireNonNull(id, "ID must not be null"));
    }
}
