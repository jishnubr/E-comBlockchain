package com.ecomblockchain.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "centralaccount")
public class CentralAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal balance = BigDecimal.ZERO;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
}
