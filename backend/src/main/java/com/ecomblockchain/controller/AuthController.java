package com.ecomblockchain.controller;

import com.ecomblockchain.config.JwtService;
import com.ecomblockchain.dto.AuthRequest;
import com.ecomblockchain.dto.AuthResponse;
import com.ecomblockchain.model.Role;
import com.ecomblockchain.model.User;
import com.ecomblockchain.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, JwtService jwtService, AuthenticationManager authenticationManager, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, "Email already exists"));
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.BUYER); // Default to buyer
        user.setName("New User"); // You'd likely add 'name' to AuthRequest in the future
        
        userRepository.save(user);
        
        // Auto-login after register
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getName()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);
        
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getName()));
    }
}
