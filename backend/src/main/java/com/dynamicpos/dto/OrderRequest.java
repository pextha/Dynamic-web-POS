package com.dynamicpos.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String tableNumber;
    private Double totalAmount; // Calculated by frontend, verified by backend ideally
    private Double taxAmount;
    private Double discountAmount;
    private List<OrderItemDto> items;

    @Data
    public static class OrderItemDto {
        private Long productId;
        private Double quantity;
    }
}
