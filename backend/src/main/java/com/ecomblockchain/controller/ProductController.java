package com.ecomblockchain.controller;

import com.ecomblockchain.dto.ApiResponse;
import com.ecomblockchain.model.Product;
import com.ecomblockchain.model.User;
import com.ecomblockchain.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> addProduct(@AuthenticationPrincipal User user, @RequestBody Product product) {
        product.setSellerId(user.getId());
        productRepository.save(product);
        return ResponseEntity.ok(new ApiResponse(true, "Product added successfully to the Blockchain catalog."));
    }
}
