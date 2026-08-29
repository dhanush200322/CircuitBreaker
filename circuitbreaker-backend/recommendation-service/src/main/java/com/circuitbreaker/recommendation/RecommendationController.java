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
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.Measurement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationController.class);

    private final MeterRegistry meterRegistry;

    public RecommendationController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    private double getMetricValue(String name, String... tags) {
        try {
            Meter meter = meterRegistry.find(name).tags(tags).meter();
            if (meter != null) {
                for (Measurement m : meter.measure()) {
                    return m.getValue();
                }
            }
        } catch (Exception e) {
            // Return default 0.0 if metric is not present
        }
        return 0.0;
    }

    @GetMapping("/resilience-summary")
    public Map<String, Object> getResilienceSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        double isOpen = getMetricValue("resilience4j.circuitbreaker.state", "name", "recommendationService", "state", "open");
        double isHalfOpen = getMetricValue("resilience4j.circuitbreaker.state", "name", "recommendationService", "state", "half_open");

        int stateValue = 0; // 0 = CLOSED, 1 = OPEN, 2 = HALF_OPEN
        if (isOpen == 1.0) stateValue = 1;
        else if (isHalfOpen == 1.0) stateValue = 2;

        double failedCalls = getMetricValue("resilience4j.circuitbreaker.calls", "name", "recommendationService", "kind", "failed");
        double notPermittedCalls = getMetricValue("resilience4j.circuitbreaker.not.permitted.calls", "name", "recommendationService");
        double failureRate = getMetricValue("resilience4j.circuitbreaker.failure.rate", "name", "recommendationService");
        double retryCalls = getMetricValue("resilience4j.retry.calls", "name", "recommendationService", "kind", "failed_with_retry");
        double timeoutCalls = getMetricValue("resilience4j.timelimiter.calls", "name", "recommendationService", "kind", "timeout");
        double rateLimiterAvailable = getMetricValue("resilience4j.ratelimiter.available.permissions", "name", "recommendationService");
        double bulkheadAvailable = getMetricValue("resilience4j.bulkhead.available.concurrent.calls", "name", "recommendationService");

        summary.put("circuitBreakerState", stateValue);
        summary.put("circuitBreakerStateValue", stateValue);
        summary.put("failedCalls", (long) failedCalls);
        summary.put("notPermittedCalls", (long) notPermittedCalls);
        summary.put("failureRate", failureRate >= 0 ? failureRate : 0.0);
        summary.put("retryCalls", (long) retryCalls);
        summary.put("timeoutCalls", (long) timeoutCalls);
        summary.put("rateLimiterAvailable", (int) rateLimiterAvailable);
        summary.put("bulkheadAvailable", (int) bulkheadAvailable);

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
