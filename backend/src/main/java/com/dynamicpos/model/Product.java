package com.dynamicpos.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer stock; // Quantity for countable items

    private String imageUrl;

    // --- Dynamic Fields based on SHOP_TYPE ---

    // For Grocery (if sold by weight)
    private Boolean isSoldByWeight;

    // For Clothing
    private String size;
    private String color;

    // For Pharmacy
    private LocalDate expiryDate;
    private String batchNumber;
}
