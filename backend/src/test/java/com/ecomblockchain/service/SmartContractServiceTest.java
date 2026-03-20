
package com.ecomblockchain.service;

import com.ecomblockchain.dto.ContractSignRequest;
import com.ecomblockchain.model.Order;
import com.ecomblockchain.model.Product;
import com.ecomblockchain.model.Role;
import com.ecomblockchain.model.User;
import com.ecomblockchain.repository.OrderRepository;
import com.ecomblockchain.repository.ProductRepository;
import com.ecomblockchain.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SmartContractServiceTest {

    @Autowired
    private ContractService contractService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    @Transactional
    void testBuyerSignReducesBalanceAndSetsOrderStatus() {
        // Arrange
        User buyer = new User();
        buyer.setName("Test Buyer");
        buyer.setEmail("testbuyer@test.com");
        buyer.setPassword("pass");
        buyer.setRole(Role.BUYER);
        buyer.setBalance(new BigDecimal("1000.00"));
        userRepository.save(buyer);

        Product product = new Product();
        product.setName("Test Product");
        product.setPrice(new BigDecimal("200.00"));
        productRepository.save(product);

        Order order = new Order();
        order.setBuyerId(buyer.getId());
        order.setProductId(product.getId());
        order.setQuantity(2);
        order.setOrderLevel("PENDING");
        orderRepository.save(order);

        ContractSignRequest request = new ContractSignRequest(order.getId());

        // Act
        String result = contractService.buyerSign(buyer, request);

        // Assert
        User updatedBuyer = userRepository.findById(buyer.getId()).orElseThrow();
        Order updatedOrder = orderRepository.findById(order.getId()).orElseThrow();

        // The user's balance should be exactly 1000 - (200 * 2) = 600
        assertEquals(new BigDecimal("600.00"), updatedBuyer.getBalance()); 
        assertEquals("BUYER_SIGNED", updatedOrder.getOrderLevel());
        assertTrue(result.contains("secured in escrow"));
    }
}
