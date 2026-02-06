package com.dynamicpos.controller;

import com.dynamicpos.model.Product;
import com.dynamicpos.service.ProductService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final Path fileStorageLocation;

    public ProductController(ProductService productService) {
        this.productService = productService;
        // Store in "uploads" directory in the project root
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public Product createProduct(@ModelAttribute Product product,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Generate unique filename
                String fileName = UUID.randomUUID().toString() + "_" + imageFile.getOriginalFilename();
                Path targetLocation = this.fileStorageLocation.resolve(fileName);
                Files.copy(imageFile.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                // Set the URL (relative path served by WebConfig)
                // Assuming the server runs on localhost:8080, valid URL path is
                // /uploads/filename
                // Use a full URL if needed, but relative path is more portable if the frontend
                // knows the base
                // However, for simplicity here, let's store the full path or root-relative path
                String fileUrl = "http://localhost:8080/uploads/" + fileName;
                product.setImageUrl(fileUrl);

            } catch (IOException ex) {
                throw new RuntimeException(
                        "Could not store file " + imageFile.getOriginalFilename() + ". Please try again!", ex);
            }
        }

        return productService.createProduct(product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }
}
