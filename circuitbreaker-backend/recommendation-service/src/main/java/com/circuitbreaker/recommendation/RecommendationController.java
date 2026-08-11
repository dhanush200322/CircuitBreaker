package com.circuitbreaker.recommendation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.RequestParam;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationController.class);

    @GetMapping("/{productId}")
    @CircuitBreaker(name = "recommendationService", fallbackMethod = "fallbackRecommendations")
    @Retry(name = "recommendationService")
    @TimeLimiter(name = "recommendationService")
    public CompletableFuture<RecommendationResponse> getRecommendations(
            @PathVariable String productId,
            @RequestParam(required = false, defaultValue = "false") boolean fail,
            @RequestParam(required = false, defaultValue = "0") int delay) {

        return CompletableFuture.supplyAsync(() -> {
            // Controlled latency simulation to demonstrate Resilience4j Timeout
            if (delay > 0) {
                try {
                    logger.warn("Simulated delay of {} ms triggered for product {}", delay, productId);
                    Thread.sleep(delay);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }

            // Controlled failure simulation to demonstrate Resilience4j Circuit Breaker and Retry
            if (fail) {
                logger.warn("Simulated failure triggered for product {}", productId);
                throw new RuntimeException("Simulated Recommendation Service failure!");
            }

            return new RecommendationResponse(productId, List.of("Accessories", "Extended Warranty"));
        });
    }

    public CompletableFuture<RecommendationResponse> fallbackRecommendations(String productId, boolean fail, int delay, Throwable t) {
        logger.error("Fallback triggered for product {}: {}", productId, t.getMessage());
        return CompletableFuture.completedFuture(new RecommendationResponse(productId, List.of("No recommendations available at this time (Fallback)")));
    }
}
