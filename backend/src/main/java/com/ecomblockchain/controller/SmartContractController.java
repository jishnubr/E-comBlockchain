package com.ecomblockchain.controller;

import com.ecomblockchain.dto.*;
import com.ecomblockchain.model.User;
import com.ecomblockchain.service.ContractService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contracts")
public class SmartContractController {

    private final ContractService contractService;

    public SmartContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/sign")
    public ResponseEntity<ApiResponse> signContract(
            @AuthenticationPrincipal User user, 
            @RequestBody ContractSignRequest request) {
            
        String resultMsg = switch (user.getRole()) {
            case BUYER -> contractService.buyerSign(user, request);
            case SELLER -> contractService.sellerSign(user, request);
            case TRANSPORTER -> contractService.transporterSign(user, request);
            case ADMIN -> contractService.adminSign(user, request);
            default -> throw new IllegalStateException("Unknown Role for Signature");
        };
        
        return ResponseEntity.ok(new ApiResponse(true, resultMsg));
    }

    @PostMapping("/dispute")
    public ResponseEntity<ApiResponse> disputeContract(
            @AuthenticationPrincipal User user, 
            @RequestBody ContractSignRequest request) {
        String resultMsg = contractService.processDispute(request.orderId(), user);
        return ResponseEntity.ok(new ApiResponse(true, resultMsg));
    }

    @PostMapping("/{orderId}/resolve/{winner}")
    public ResponseEntity<ApiResponse> resolveDispute(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @PathVariable String winner) {
            
        if (user.getRole() != com.ecomblockchain.model.Role.ADMIN) {
            throw new RuntimeException("Unauthorized: Only Admins can manually resolve disputes.");
        }
        String resultMsg = contractService.resolveDispute(orderId, winner);
        return ResponseEntity.ok(new ApiResponse(true, resultMsg));
    }

    @PostMapping("/buyer/place-order")
    public ResponseEntity<ApiResponse> placeOrder(
            @AuthenticationPrincipal User user,
            @RequestBody OrderRequestDto request) {
        if (user.getRole() != com.ecomblockchain.model.Role.BUYER) throw new RuntimeException("Unauthorized.");
        String resultMsg = contractService.placeOrder(user, request);
        return ResponseEntity.ok(new ApiResponse(true, resultMsg));
    }

    @PostMapping("/claim/{orderId}")
    public ResponseEntity<ApiResponse> claimOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        if (user.getRole() != com.ecomblockchain.model.Role.TRANSPORTER) throw new RuntimeException("Unauthorized.");
        String resultMsg = contractService.claimOrder(user, orderId);
        return ResponseEntity.ok(new ApiResponse(true, resultMsg));
    }

    @PostMapping("/handover/{orderId}/{nextTransporterId}")
    public ResponseEntity<ApiResponse> handoverOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId,
            @PathVariable Long nextTransporterId) {
        if (user.getRole() != com.ecomblockchain.model.Role.TRANSPORTER) throw new RuntimeException("Unauthorized.");
        String resultMsg = contractService.handoverOrder(orderId, user, nextTransporterId);
        return ResponseEntity.ok(new ApiResponse(true, resultMsg));
    }
}
