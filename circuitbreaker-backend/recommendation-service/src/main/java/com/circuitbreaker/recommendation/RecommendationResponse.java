package com.circuitbreaker.recommendation;

import java.util.List;

public record RecommendationResponse(String productId, List<String> recommendations) {}
