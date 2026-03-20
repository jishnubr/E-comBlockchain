package com.ecomblockchain.config;

import com.ecomblockchain.model.Role;
import com.ecomblockchain.model.User;
import com.ecomblockchain.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
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
            userRepository.save(buyer);

            User seller = new User();
            seller.setName("Amazon Seller");
            seller.setEmail("seller@test.com");
            seller.setPassword(passwordEncoder.encode("password"));
            seller.setRole(Role.SELLER);
            userRepository.save(seller);

            System.out.println("✅ Test users seeded in H2 Database! (buyer@test.com / password)");
        }
    }
}
