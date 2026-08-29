package com.circuitbreaker.recommendation;

import io.micrometer.observation.ObservationPredicate;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.server.observation.ServerRequestObservationContext;

@SpringBootApplication
public class RecommendationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecommendationServiceApplication.class, args);
    }

    @Bean
    ObservationPredicate noActuatorObservationPredicate() {
        return (name, context) -> {
            if (context instanceof ServerRequestObservationContext serverContext) {
                String uri = serverContext.getCarrier().getRequestURI();
                if (uri != null && (uri.startsWith("/actuator") || uri.contains("resilience-summary"))) {
                    return false;
                }
            }
            return true;
        };
    }
}
