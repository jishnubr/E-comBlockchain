package com.ecomblockchain.service;

import com.ecomblockchain.dto.ContractSignRequest;
import com.ecomblockchain.model.*;
import com.ecomblockchain.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AdminSettlementTest {

    @Autowired private ContractService contractService;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CentralAccountRepository centralAccountRepository;

    @Test
    @Transactional
    void testAdminSettlementDistributesFundsCorrectly() {
        // Arrange (Using users seeded by DataInitializer to prevent duplicates)
        User admin = userRepository.findByRole(Role.ADMIN);
        admin.setBalance(new BigDecimal("0.00"));
        userRepository.save(admin);

        // For simplicity, let's grab the first SELLER we find (seeded is seller@test.com)
        User seller = userRepository.findAll().stream().filter(u -> u.getRole() == Role.SELLER).findFirst().orElseThrow();
        seller.setBalance(new BigDecimal("500.00"));
        userRepository.save(seller);

        User transporter = userRepository.findByRole(Role.TRANSPORTER);
        transporter.setBalance(new BigDecimal("100.00"));
        userRepository.save(transporter);

        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(new BigDecimal("1000.00"));
        product.setSellerId(seller.getId());
        productRepository.save(product);

        Order order = new Order();
        order.setProductId(product.getId());
        order.setQuantity(1);
        order.setOrderLevel("DELIVERED");
        orderRepository.save(order);

        CentralAccount vault = new CentralAccount();
        vault.setBalance(new BigDecimal("1000.00"));
        centralAccountRepository.save(vault);

        ContractSignRequest request = new ContractSignRequest(order.getId());

        // Act - Settles the order of value $1000
        contractService.adminSign(admin, request);

        // Assert
        User updatedSeller = userRepository.findById(seller.getId()).orElseThrow();
        User updatedTransporter = userRepository.findById(transporter.getId()).orElseThrow();
        User updatedAdmin = userRepository.findById(admin.getId()).orElseThrow();
        Order updatedOrder = orderRepository.findById(order.getId()).orElseThrow();

        // Admin gets 2% of 1000 = $20. Previous balance 0 -> 20.
        // Transporter gets 5% of 1000 = $50. Previous balance 100 -> 150.
        // Seller gets 93% of 1000 = $930. Previous balance 500 -> 1430.
        assertEquals(0, new BigDecimal("1430.00").compareTo(updatedSeller.getBalance()), "Seller did not receive 93%");
        assertEquals(0, new BigDecimal("150.00").compareTo(updatedTransporter.getBalance()), "Transporter did not receive 5%");
        assertEquals(0, new BigDecimal("20.00").compareTo(updatedAdmin.getBalance()), "Admin did not receive 2%");
        assertEquals("CLOSED_AND_SETTLED", updatedOrder.getOrderLevel());
    }
}
