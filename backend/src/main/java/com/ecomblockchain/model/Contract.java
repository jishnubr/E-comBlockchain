package com.ecomblockchain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "contracts")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    @Lob
    private byte[] buyerSignature;

    @Lob
    private byte[] sellerSignature;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public byte[] getBuyerSignature() { return buyerSignature; }
    public void setBuyerSignature(byte[] buyerSignature) { this.buyerSignature = buyerSignature; }

    public byte[] getSellerSignature() { return sellerSignature; }
    public void setSellerSignature(byte[] sellerSignature) { this.sellerSignature = sellerSignature; }
}
