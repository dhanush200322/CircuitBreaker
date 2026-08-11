package com.circuitbreaker.inventory;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @GetMapping("/{productId}")
    public InventoryResponse getInventory(@PathVariable String productId) {
        boolean inStock = true;
        return new InventoryResponse(productId, inStock, 100);
    }
}
