package com.circuitbreaker.product;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping
    public List<ProductResponse> getProducts() {
        return List.of(
            new ProductResponse("1", "Laptop", 999.99),
            new ProductResponse("2", "Smartphone", 599.99)
        );
    }
}
