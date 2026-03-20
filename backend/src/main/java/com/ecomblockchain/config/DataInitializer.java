package com.ecomblockchain.config;

import com.ecomblockchain.model.*;
import com.ecomblockchain.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CentralAccountRepository centralAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, ProductRepository productRepository, 
                           OrderRepository orderRepository, CentralAccountRepository centralAccountRepository, 
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.centralAccountRepository = centralAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User buyer = new User();
            buyer.setName("Jishnu Buyer");
            buyer.setEmail("buyer@test.com");
            buyer.setPassword(passwordEncoder.encode("password"));
            buyer.setRole(Role.BUYER);
            buyer.setBalance(new BigDecimal("10000.00"));
            buyer = userRepository.save(buyer);

            User seller = new User();
            seller.setName("Amazon Seller");
            seller.setEmail("seller@test.com");
            seller.setPassword(passwordEncoder.encode("password"));
            seller.setRole(Role.SELLER);
            seller = userRepository.save(seller);

            User transporter = new User();
            transporter.setName("FedEx Transporter");
            transporter.setEmail("transporter@test.com");
            transporter.setPassword(passwordEncoder.encode("password"));
            transporter.setRole(Role.TRANSPORTER);
            userRepository.save(transporter);

            User admin = new User();
            admin.setName("System Arbitrator");
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("password"));
            admin.setRole(Role.ADMIN);
            admin.setBalance(BigDecimal.ZERO);
            userRepository.save(admin);

            CentralAccount central = new CentralAccount();
            central.setBalance(BigDecimal.ZERO);
            centralAccountRepository.save(central);

            Product product = new Product();
            product.setName("Blockchain Mining Rig");
            product.setPrice(new BigDecimal("500.00"));
            product.setQuantity(10);
            product.setSellerId(seller.getId());
            product = productRepository.save(product);

            Order order = new Order();
            order.setBuyerId(buyer.getId());
            order.setProductId(product.getId());
            order.setPrice(product.getPrice());
            order.setOrderLevel("PENDING");
            order.setCurrLocation("Warehouse 1A");
            orderRepository.save(order);

            System.out.println("✅ Full Core Engine Seeded! buyer, seller, transporter, admin @test.com / password");
        }
    }
}
