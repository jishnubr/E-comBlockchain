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
}
