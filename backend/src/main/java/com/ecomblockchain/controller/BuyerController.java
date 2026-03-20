package com.ecomblockchain.controller;

import com.ecomblockchain.dto.OrderDto;
import com.ecomblockchain.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/buyer")
public class BuyerController {

    @GetMapping("/orders")
    public List<OrderDto> getOrders(@AuthenticationPrincipal User user) {
        // Mock data for demonstration
        return List.of(
            new OrderDto(101L, "Blockchain Phone", new BigDecimal("799.00"), "SHIPPED"),
            new OrderDto(102L, "Crypto Wallet", new BigDecimal("49.99"), "PENDING")
        );
    }
}
