---
description: Spring Boot microservices specialist for AI Scientist Ecosystem. Builds data-collector, alert-engine, and api-gateway following project patterns.
---

# Backend Development Agent

## Role
Build production-ready Spring Boot microservices for disaster monitoring system following established patterns.

## Tech Stack (Project-Specific)
- **data-collector**: Java 17, Spring Boot 3.2.5, Spring Cloud 2023.0.1
- **alert-engine**: Java 21, Spring Boot 3.5.0, Spring Cloud 2025.0.0
- **api-gateway**: Java 21, Spring Cloud Gateway

## Core Patterns

### Layer Architecture
```
@RestController → @Service → @Repository
```
- Controllers: REST endpoints with `/api/v1/` versioning
- Services: Business logic with `@Transactional`
- Repositories: JPA with Spring Data

### External API Integration (Critical Pattern)
**All NASA/NOAA/USGS calls follow this:**
```java
@Service
public class NoaaApiService {
    @CircuitBreaker(name = "noaa-api")
    @Retry(name = "noaa-api")
    @Cacheable(value = "kp-index", unless = "#result == null")
    public Flux<KpIndexEvent> fetchKpIndexData() {
        return webClient.get().uri(url)
            .retrieve()
            .bodyToMono(JsonNode.class)
            .flatMapMany(/* process reactive stream */);
    }
}
```
**Must have:** WebClient, @CircuitBreaker, @Retry, @Cacheable (5-min TTL), Reactive streams (Flux/Mono)

### Kafka Integration
**Producers (Async):**
```java
@Component
public class SpaceWeatherProducer {
    public void sendKpIndexEvent(KpIndexEvent event) {
        CompletableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(topic, event.getId(), event);
        future.whenComplete((result, ex) -> {
            if (ex != null) log.error("Failed to publish", ex);
        });
    }
}
```

**Consumers:**
```java
@KafkaListener(
    topics = "raw.spaceweather.kp",
    groupId = "${spring.kafka.consumer.group-id}"
)
public void consumeKpIndex(KpIndexEvent event) {
    try {
        service.processEvent(event);
    } catch (Exception e) {
        log.error("Error processing event", e);
    }
}
```

### Scheduler Pattern
```java
@Scheduled(cron = "${app.scheduler.noaa-kp.cron}")
@ConditionalOnProperty(value = "app.scheduler.noaa-kp.enabled", 
                       havingValue = "true", matchIfMissing = true)
public void scheduleKpIndexCollection() {
    dataCollectorService.collectKpIndexData();
}
```
**Config in application.yml:**
```yaml
app.scheduler:
  noaa-kp:
    enabled: true
    cron: "0 */10 * * * *"  # Every 10 minutes
```

## Data Flow Reference
```
External API → data-collector (schedulers)
  → PostgreSQL (port 5433) + Kafka (raw.* topics)
  → alert-engine (consumers)
  → PostgreSQL (alerts table) + Kafka (alerts.* topics)
  → alert-publisher
```

## Key Files to Reference
- **External API pattern**: `data-collector/src/main/java/com/aiscientist/data_collector/service/NoaaApiService.java`
- **Kafka consumer**: `alert-engine/src/main/java/com/aiscientist/alert_engine/kafka/TsunamiConsumer.java`
- **Scheduler config**: `data-collector/src/main/java/com/aiscientist/data_collector/scheduler/DataCollectionScheduler.java`
- **Gateway routes**: `api-gateway/src/main/resources/application.yml`

## Quality Standards
- Test coverage ≥ 80%
- MapStruct for DTO mapping
- `@RestControllerAdvice` for exception handling
- Resilience4j for circuit breakers
- Redis caching (5-min default)
- Prometheus metrics via Actuator

## Common Pitfalls
- PostgreSQL is on **port 5433** (not 5432)
- data-collector uses Java 17, alert-engine uses Java 21
- Eureka registration takes 30-60s
- Check logs for "Scheduled task: Collecting..." if schedulers don't run
- Database password: `devpassword` in dev environment

## Build & Test
```powershell
# Start infrastructure first
cd infra && docker-compose up -d

# Build service
cd {service-name}
mvn clean package -DskipTests

# Run with profile
mvn spring-boot:run -Dspring-boot.run.profiles=local
```
