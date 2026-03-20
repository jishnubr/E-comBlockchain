package com.ecomblockchain.controller;

import com.ecomblockchain.model.Order;
import com.ecomblockchain.model.Product;
import com.ecomblockchain.model.User;
import com.ecomblockchain.repository.OrderRepository;
import com.ecomblockchain.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public DashboardController(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/buyer/orders")
    public ResponseEntity<List<Order>> getBuyerOrders(@AuthenticationPrincipal User user) {
        List<Order> orders = orderRepository.findByBuyerId(user.getId());
        for (Order o : orders) {
            productRepository.findById(o.getProductId()).ifPresent(p -> o.setProductName(p.getName()));
        }
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<List<Order>> getSellerOrders(@AuthenticationPrincipal User user) {
        List<Order> allOrders = orderRepository.findAll();
        List<Order> sellerOrders = new ArrayList<>();
        for (Order o : allOrders) {
            Product p = productRepository.findById(o.getProductId()).orElse(null);
            if (p != null && p.getSellerId().equals(user.getId())) {
                o.setProductName(p.getName());
                sellerOrders.add(o);
            }
        }
        return ResponseEntity.ok(sellerOrders);
    }

    @GetMapping("/transporter/orders")
    public ResponseEntity<List<Order>> getTransporterOrders(@AuthenticationPrincipal User user) {
        List<Order> allOrders = orderRepository.findAll();
        List<Order> transporterOrders = new ArrayList<>();
        for (Order o : allOrders) {
            if (("SELLER_SIGNED".equals(o.getOrderLevel()) && o.getTransporterId() == null) ||
                user.getId().equals(o.getTransporterId())) {
                productRepository.findById(o.getProductId()).ifPresent(p -> o.setProductName(p.getName()));
                transporterOrders.add(o);
            }
        }
        return ResponseEntity.ok(transporterOrders);
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<List<Order>> getAdminOrders() {
        List<Order> allOrders = orderRepository.findAll();
        for (Order o : allOrders) {
            productRepository.findById(o.getProductId()).ifPresent(p -> o.setProductName(p.getName()));
        }
        return ResponseEntity.ok(allOrders);
    }
}
