package com.ecomblockchain.service;

import com.ecomblockchain.dto.ContractSignRequest;
import com.ecomblockchain.model.User;
import org.springframework.stereotype.Service;

@Service
public class ContractService {

    public String buyerSign(User user, ContractSignRequest request) {
        return "Buyer " + user.getName() + " signed order " + request.orderId();
    }

    public String sellerSign(User user, ContractSignRequest request) {
        return "Seller " + user.getName() + " signed order " + request.orderId();
    }

    public String transporterSign(User user, ContractSignRequest request) {
        return "Transporter " + user.getName() + " signed order " + request.orderId();
    }

    public String adminSign(User user, ContractSignRequest request) {
        return "Admin " + user.getName() + " signed order " + request.orderId();
    }
}
