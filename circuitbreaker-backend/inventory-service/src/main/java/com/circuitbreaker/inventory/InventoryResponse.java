package com.circuitbreaker.inventory;

public record InventoryResponse(String productId, boolean inStock, int quantity) {}
