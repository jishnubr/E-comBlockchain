package com.ecomblockchain.model;

import jakarta.persistence.*;

@Entity
@Table(name = "blocks")
public class Block {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(updatable = false, nullable = false)
    private String hashValue;

    @Column(updatable = false)
    private String previousHash;

    @Column(updatable = false)
    private java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();

    private String privateKey;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHashValue() { return hashValue; }
    public void setHashValue(String hashValue) { this.hashValue = hashValue; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getPrivateKey() { return privateKey; }
    public void setPrivateKey(String privateKey) { this.privateKey = privateKey; }
}
