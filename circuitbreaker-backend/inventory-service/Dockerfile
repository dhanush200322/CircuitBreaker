# Stage 1: Build with Maven from root parent POM
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY circuitbreaker-backend ./
RUN mvn clean package -DskipTests -pl inventory-service -am

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/inventory-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]

