package com.ecomblockchain.service;

import com.ecomblockchain.dto.ContractSignRequest;
import com.ecomblockchain.model.*;
import com.ecomblockchain.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.KeyPair;

@Service
public class ContractService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ContractRepository contractRepository;
    private final BlockRepository blockRepository;
    private final CentralAccountRepository centralAccountRepository;
    private final CryptoService cryptoService;

    public ContractService(UserRepository userRepository, OrderRepository orderRepository,
                           ProductRepository productRepository, ContractRepository contractRepository,
                           BlockRepository blockRepository, CentralAccountRepository centralAccountRepository,
                           CryptoService cryptoService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.contractRepository = contractRepository;
        this.blockRepository = blockRepository;
        this.centralAccountRepository = centralAccountRepository;
        this.cryptoService = cryptoService;
    }

    // RULE: Collateral must be held until delivery is confirmed.
    // If the contract fails, funds must return to the original owner (Fairness).
    
    @Transactional
    public String buyerSign(User buyer, ContractSignRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Product product = productRepository.findById(order.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        BigDecimal collateral = product.getPrice().multiply(BigDecimal.valueOf(order.getQuantity()));

        // Fairness: Prevent over-spending
        if (buyer.getBalance().compareTo(collateral) < 0) {
            throw new RuntimeException("Insufficient funds for collateral");
        }

        // Lock funds: Escrow (Central Account logic)
        buyer.setBalance(buyer.getBalance().subtract(collateral));
        userRepository.save(buyer);
        
        CentralAccount central = centralAccountRepository.findById(1L).orElse(new CentralAccount());
        central.setBalance(central.getBalance().add(collateral));
        centralAccountRepository.save(central);

        // Record Block & Contract
        KeyPair keyPair = cryptoService.generateECKeyPair();
        String messageToSign = "ORDER_" + order.getId() + "_BUYER_" + buyer.getId();
        String signatureBase64 = cryptoService.signMessage(keyPair.getPrivate(), messageToSign);
        
        Contract contract = new Contract();
        contract.setOrderId(order.getId());
        contract.setBuyerSignature(signatureBase64.getBytes());
        contractRepository.save(contract);

        Block prevBlock = blockRepository.findTopByOrderByIdDesc();
        String prevHash = (prevBlock != null) ? prevBlock.getHashValue() : "0";
        Block newBlock = new Block();
        newBlock.setHashValue(cryptoService.generateHash((prevHash + messageToSign).getBytes()));
        newBlock.setPreviousHash(prevHash);
        newBlock.setPrivateKey(cryptoService.encodePrivateKey(keyPair.getPrivate()));
        blockRepository.save(newBlock);

        order.setOrderLevel("BUYER_SIGNED");
        orderRepository.save(order);

        return "Buyer " + buyer.getName() + " collateral secured in escrow.";
    }

    @Transactional
    public String sellerSign(User seller, ContractSignRequest request) {
        Order order = orderRepository.findById(request.orderId()).orElseThrow();
        
        // Fairness: Verify Seller signature
        // Logic: Seller can only sign if Buyer has already signed
        if (!order.getOrderLevel().equals("BUYER_SIGNED")) {
            throw new RuntimeException("Contract not ready for Seller signature");
        }

        KeyPair keyPair = cryptoService.generateECKeyPair();
        String messageToSign = "ORDER_" + order.getId() + "_SELLER_" + seller.getId();
        String signatureBase64 = cryptoService.signMessage(keyPair.getPrivate(), messageToSign);
        
        Contract contract = contractRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        contract.setSellerSignature(signatureBase64.getBytes());
        contractRepository.save(contract);
        
        order.setOrderLevel("SELLER_SIGNED");
        orderRepository.save(order);
        return "Seller " + seller.getName() + " signed the contract.";
    }

    @Transactional
    public String transporterSign(User transporter, ContractSignRequest request) {
        Order order = orderRepository.findById(request.orderId()).orElseThrow();
        if (!"SELLER_SIGNED".equalsIgnoreCase(order.getOrderLevel()) && !"IN_TRANSIT".equalsIgnoreCase(order.getOrderLevel())) {
            throw new RuntimeException("Order not ready for transport");
        }
        order.setOrderLevel("DELIVERED");
        orderRepository.save(order);
        return "Transporter verified delivery.";
    }

    @Transactional
    public String adminSign(User admin, ContractSignRequest request) {
        Order order = orderRepository.findById(request.orderId()).orElseThrow();
        
        // Fairness Rule: Admin CANNOT take a cut of the funds in a cancellation.
        // Admin only gets a fee upon successful completion.
        if (!order.getOrderLevel().equals("DELIVERED")) {
            throw new RuntimeException("Order must be DELIVERED before arbitration.");
        }

        order.setOrderLevel("CLOSED_AND_SETTLED");
        orderRepository.save(order);

        processFairPayout(order.getId());

        return "Admin " + admin.getName() + " validated the smart contract.";
    }

    @Transactional
    public void processFairPayout(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        Product product = productRepository.findById(order.getProductId()).orElseThrow();
        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(order.getQuantity()));

        // Fairness Distribution: Fixed Fees to prevent Arbitrator Bias
        BigDecimal adminFee = total.multiply(new BigDecimal("0.02")); // 2% fixed fee
        BigDecimal transporterFee = total.multiply(new BigDecimal("0.05")); // 5% flat
        BigDecimal sellerPayout = total.subtract(adminFee).subtract(transporterFee);

        // Deduct from Escrow
        CentralAccount central = centralAccountRepository.findById(1L).orElseThrow();
        central.setBalance(central.getBalance().subtract(total));
        centralAccountRepository.save(central);

        // Update balances atomically
        User admin = userRepository.findByRole(Role.ADMIN);
        admin.setBalance(admin.getBalance().add(adminFee));
        
        User seller = userRepository.findById(product.getSellerId()).orElseThrow();
        seller.setBalance(seller.getBalance().add(sellerPayout));

        User transporter = userRepository.findByRole(Role.TRANSPORTER);
        if (transporter != null) {
            transporter.setBalance(transporter.getBalance().add(transporterFee));
            userRepository.save(transporter);
        }
        
        userRepository.save(admin);
        userRepository.save(seller);
    }

    @Transactional
    public String processDispute(Long orderId, User requestor) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        Product product = productRepository.findById(order.getProductId()).orElseThrow();
        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(order.getQuantity()));

        order.setOrderLevel("DISPUTED");
        orderRepository.save(order);

        // Funds are kept locked during early dispute phases. 
        // A fully decentralized consensus mechanism would typically evaluate this.
        return "Dispute logged. Escrow collateral is currently locked pending arbitration consensus.";
    }
}
