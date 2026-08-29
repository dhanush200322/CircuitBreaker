package com.circuitbreaker.recommendation;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.concurrent.CompletableFuture;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.retry.RetryRegistry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import io.github.resilience4j.timelimiter.TimeLimiterRegistry;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadRegistry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationController.class);

    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final RetryRegistry retryRegistry;
    private final RateLimiterRegistry rateLimiterRegistry;
    private final BulkheadRegistry bulkheadRegistry;
    private final TimeLimiterRegistry timeLimiterRegistry;

    public RecommendationController(
            CircuitBreakerRegistry circuitBreakerRegistry,
            RetryRegistry retryRegistry,
            RateLimiterRegistry rateLimiterRegistry,
            BulkheadRegistry bulkheadRegistry,
            TimeLimiterRegistry timeLimiterRegistry) {
        this.circuitBreakerRegistry = circuitBreakerRegistry;
        this.retryRegistry = retryRegistry;
        this.rateLimiterRegistry = rateLimiterRegistry;
        this.bulkheadRegistry = bulkheadRegistry;
        this.timeLimiterRegistry = timeLimiterRegistry;
    }

    @GetMapping("/resilience-summary")
    public Map<String, Object> getResilienceSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        io.github.resilience4j.circuitbreaker.CircuitBreaker cb = 
                circuitBreakerRegistry.find("recommendationService").orElse(null);
        int stateValue = 0; // 0 = CLOSED, 1 = OPEN, 2 = HALF_OPEN
        if (cb != null) {
            io.github.resilience4j.circuitbreaker.CircuitBreaker.State state = cb.getState();
            if (state == io.github.resilience4j.circuitbreaker.CircuitBreaker.State.OPEN) stateValue = 1;
            else if (state == io.github.resilience4j.circuitbreaker.CircuitBreaker.State.HALF_OPEN) stateValue = 2;

            summary.put("circuitBreakerState", stateValue);
            summary.put("circuitBreakerStateValue", stateValue);
            summary.put("failedCalls", cb.getMetrics().getNumberOfFailedCalls());
            summary.put("notPermittedCalls", cb.getMetrics().getNumberOfNotPermittedCalls());
            summary.put("failureRate", cb.getMetrics().getFailureRate());
        } else {
            summary.put("circuitBreakerState", 0);
            summary.put("circuitBreakerStateValue", 0);
            summary.put("failedCalls", 0);
            summary.put("notPermittedCalls", 0);
            summary.put("failureRate", 0.0);
        }

        io.github.resilience4j.retry.Retry retry = 
                retryRegistry.find("recommendationService").orElse(null);
        summary.put("retryCalls", retry != null ? retry.getMetrics().getNumberOfFailedWithRetryCalls() : 0);

        io.github.resilience4j.timelimiter.TimeLimiter timeLimiter = 
                timeLimiterRegistry.find("recommendationService").orElse(null);
        summary.put("timeoutCalls", timeLimiter != null ? timeLimiter.getMetrics().getNumberOfTimeoutCalls() : 0);

        io.github.resilience4j.ratelimiter.RateLimiter rateLimiter = 
                rateLimiterRegistry.find("recommendationService").orElse(null);
        summary.put("rateLimiterAvailable", rateLimiter != null ? rateLimiter.getMetrics().getAvailablePermissions() : 5);

        io.github.resilience4j.bulkhead.Bulkhead bulkhead = 
                bulkheadRegistry.find("recommendationService").orElse(null);
        summary.put("bulkheadAvailable", bulkhead != null ? bulkhead.getMetrics().getAvailableConcurrentCalls() : 1);

        return summary;
    }

    @GetMapping("/{productId}")
    @CircuitBreaker(name = "recommendationService", fallbackMethod = "fallbackRecommendations")
    @RateLimiter(name = "recommendationService")
    @Bulkhead(name = "recommendationService")
    @Retry(name = "recommendationService")
    @TimeLimiter(name = "recommendationService")
    public CompletableFuture<RecommendationResponse> getRecommendations(
            @PathVariable String productId,
            @RequestParam(required = false, defaultValue = "false") boolean fail,
            @RequestParam(required = false, defaultValue = "0") int delay) {

        return CompletableFuture.supplyAsync(() -> {
            if (delay > 0) {
                try {
                    logger.warn("Simulated delay of {} ms triggered for product {}", delay, productId);
                    Thread.sleep(delay);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }

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
