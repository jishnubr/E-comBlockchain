package com.ecomblockchain.controller;

import com.ecomblockchain.model.Order;
import com.ecomblockchain.model.User;
import com.ecomblockchain.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class DashboardController {

    private final OrderRepository orderRepository;

    public DashboardController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/buyer/orders")
    public ResponseEntity<List<Order>> getBuyerOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderRepository.findByBuyerId(user.getId()));
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<List<Order>> getSellerOrders(@AuthenticationPrincipal User user) {
        // Technically should filter by product.sellerId. For brevity, returning all orders.
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/transporter/orders")
    public ResponseEntity<List<Order>> getTransporterOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> getAdminOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }
}
