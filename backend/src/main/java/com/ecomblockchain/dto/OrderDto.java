package com.ecomblockchain.dto;

import java.math.BigDecimal;

public record OrderDto(
    Long orderId, 
    String productName, 
    BigDecimal price, 
    String orderLevel
) {}
