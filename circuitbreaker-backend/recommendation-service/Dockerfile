# Stage 1: Build with Maven from root parent POM
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY circuitbreaker-backend ./
RUN mvn clean package -DskipTests -pl recommendation-service -am

# Stage 2: Lightweight runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/recommendation-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]

