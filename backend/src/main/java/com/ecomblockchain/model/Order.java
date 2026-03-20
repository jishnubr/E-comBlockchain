package com.ecomblockchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "orders") // "order" is a reserved SQL keyword
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long buyerId;
    private Long productId;
    private String orderLevel;
    private String currLocation;
    private BigDecimal price; // Price snapped at time of purchase
    private Integer quantity = 1;
    private Integer verificationStrikes = 0;

    @Version
    private Integer version;

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getOrderLevel() { return orderLevel; }
    public void setOrderLevel(String orderLevel) { this.orderLevel = orderLevel; }

    public String getCurrLocation() { return currLocation; }
    public void setCurrLocation(String currLocation) { this.currLocation = currLocation; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getVerificationStrikes() { return verificationStrikes; }
    public void setVerificationStrikes(Integer verificationStrikes) { this.verificationStrikes = verificationStrikes; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
