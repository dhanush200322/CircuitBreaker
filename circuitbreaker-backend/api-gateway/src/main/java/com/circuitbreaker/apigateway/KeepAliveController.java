package com.circuitbreaker.apigateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
public class KeepAliveController {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${keepalive.urls.gateway:https://circuitbreaker-gateway.onrender.com/actuator/health}")
    private String gatewayUrl;

    @Value("${keepalive.urls.eureka:https://circuitbreaker-eureka.onrender.com/}")
    private String eurekaUrl;

    @Value("${keepalive.urls.product:https://circuitbreaker-product.onrender.com/actuator/health}")
    private String productUrl;

    @Value("${keepalive.urls.inventory:https://circuitbreaker-inventory.onrender.com/actuator/health}")
    private String inventoryUrl;

    @Value("${keepalive.urls.recommendation:https://circuitbreaker-recommendation.onrender.com/actuator/health}")
    private String recommendationUrl;

    @Value("${keepalive.urls.zipkin:https://circuitbreaker-zipkin.onrender.com/zipkin/}")
    private String zipkinUrl;

    @GetMapping("/keep-alive")
    public CompletableFuture<Map<String, Object>> keepAlive() {
        Map<String, String> targets = new LinkedHashMap<>();
        targets.put("gateway", gatewayUrl);
        targets.put("eureka", eurekaUrl);
        targets.put("product", productUrl);
        targets.put("inventory", inventoryUrl);
        targets.put("recommendation", recommendationUrl);
        targets.put("zipkin", zipkinUrl);

        Map<String, CompletableFuture<Map<String, Object>>> futures = targets.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> pingService(entry.getKey(), entry.getValue()),
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        return CompletableFuture.allOf(futures.values().toArray(new CompletableFuture[0]))
                .thenApply(v -> {
                    Map<String, Object> results = new LinkedHashMap<>();
                    long successCount = 0;
                    for (Map.Entry<String, CompletableFuture<Map<String, Object>>> entry : futures.entrySet()) {
                        Map<String, Object> serviceResult = entry.getValue().join();
                        results.put(entry.getKey(), serviceResult);
                        if ("UP".equals(serviceResult.get("status"))) {
                            successCount++;
                        }
                    }
                    Map<String, Object> response = new LinkedHashMap<>();
                    response.put("timestamp", System.currentTimeMillis());
                    response.put("status", successCount == targets.size() ? "HEALTHY" : "DEGRADED");
                    response.put("successfulPings", successCount + "/" + targets.size());
                    response.put("services", results);
                    return response;
                });
    }

    private CompletableFuture<Map<String, Object>> pingService(String name, String url) {
        long startTime = System.currentTimeMillis();
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            return httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                    .thenApply(response -> {
                        long duration = System.currentTimeMillis() - startTime;
                        Map<String, Object> res = new LinkedHashMap<>();
                        boolean isOk = response.statusCode() >= 200 && response.statusCode() < 400;
                        res.put("status", isOk ? "UP" : "DOWN");
                        res.put("statusCode", response.statusCode());
                        res.put("responseTimeMs", duration);
                        res.put("url", url);
                        return res;
                    })
                    .exceptionally(ex -> {
                        long duration = System.currentTimeMillis() - startTime;
                        Map<String, Object> res = new LinkedHashMap<>();
                        res.put("status", "DOWN");
                        res.put("error", ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage());
                        res.put("responseTimeMs", duration);
                        res.put("url", url);
                        return res;
                    });
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("status", "DOWN");
            res.put("error", e.getMessage());
            res.put("responseTimeMs", duration);
            res.put("url", url);
            return CompletableFuture.completedFuture(res);
        }
    }
}
