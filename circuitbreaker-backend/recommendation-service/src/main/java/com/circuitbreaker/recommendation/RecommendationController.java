package com.circuitbreaker.recommendation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationController.class);

    @GetMapping("/{productId}")
    @CircuitBreaker(name = "recommendationService", fallbackMethod = "fallbackRecommendations")
    public RecommendationResponse getRecommendations(
            @PathVariable String productId,
            @RequestParam(required = false, defaultValue = "false") boolean fail) {

        // Controlled failure simulation to demonstrate Resilience4j Circuit Breaker
        if (fail) {
            logger.warn("Simulated failure triggered for product {}", productId);
            throw new RuntimeException("Simulated Recommendation Service failure!");
        }

        return new RecommendationResponse(productId, List.of("Accessories", "Extended Warranty"));
    }

    public RecommendationResponse fallbackRecommendations(String productId, boolean fail, Throwable t) {
        logger.error("Fallback triggered for product {}: {}", productId, t.getMessage());
        return new RecommendationResponse(productId, List.of("No recommendations available at this time (Fallback)"));
    }
}
