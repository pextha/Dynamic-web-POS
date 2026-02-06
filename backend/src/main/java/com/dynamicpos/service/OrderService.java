package com.dynamicpos.service;

import com.dynamicpos.dto.OrderRequest;
import com.dynamicpos.model.*;
import com.dynamicpos.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = new Order();
        order.setOrderDate(LocalDateTime.now());
        order.setTableNumber(request.getTableNumber());

        List<OrderItem> items = new ArrayList<>();
        double calculatedTotal = 0;

        for (OrderRequest.OrderItemDto itemDto : request.getItems()) {
            Product product = productRepository
                    .findById(java.util.Objects.requireNonNull(itemDto.getProductId(), "Product ID must not be null"))
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(product.getPrice());

            double subTotal = product.getPrice() * itemDto.getQuantity();
            item.setSubTotal(subTotal);

            calculatedTotal += subTotal;
            items.add(item);

            // Update stock if it's not a weight based item (usually weight based items are
            // also stocked, but for simplicity let's decrement)
            if (product.getStock() != null) {
                product.setStock((int) (product.getStock() - itemDto.getQuantity()));
                productRepository.save(product);
            }
        }

        order.setItems(items);
        order.setTotalAmount(calculatedTotal);

        // Simple trust of frontend tax/discount for demo, or verify here.
        // Ideally should be calculated backend side based on config.
        // We will take request values but we should really re-calculate them.
        // For this demo, let's use the request values but ensure they exist.
        order.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : 0.0);
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : 0.0);
        order.setFinalAmount(calculatedTotal + order.getTaxAmount() - order.getDiscountAmount());

        return orderRepository.save(order);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
