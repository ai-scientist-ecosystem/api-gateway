# AI Scientist Ecosystem - Copilot Instructions

## 🎯 Project Overview
Disaster monitoring and alerting system with microservices architecture. Ingests data from NASA/NOAA/USGS for space weather, earthquakes, floods, and tsunamis, processes alerts via Kafka streams, and delivers via Cell Broadcast.

## 🏗️ Architecture & Service Boundaries

### Microservices (Spring Boot + Spring Cloud)
- **data-collector** (port 8082): Scheduled data ingestion from external APIs → PostgreSQL + Kafka producers
  - Java 17, Spring Boot 3.2.5, Spring Cloud 2023.0.1
  - Schedulers: Kp-index (10m), CME (15m), NOAA tides (5m), USGS water (10m), earthquakes (2m)
- **alert-engine** (port 8083): Kafka consumers → Rule-based alert detection → Alert persistence + Kafka publishers
  - Java 21, Spring Boot 3.5.0, Spring Cloud 2025.0.0 (newer version)
  - Consumes from `raw.*` topics, publishes to `alerts.*` topics
- **api-gateway** (port 8085): Spring Cloud Gateway → Routes, circuit breakers, load balancing via Eureka
  - Java 21, routes `/api/data-collector/**`, `/api/alerts/**`, `/api/earthquakes/**`, `/api/water-levels/**`
- **alert-publisher** (port 8084): Alert delivery to Cell Broadcast APIs

### Infrastructure Services
- **Eureka Server** (port 8761): Service discovery - credentials `admin/admin`
- **Config Server** (port 8888): Centralized configuration
- **PostgreSQL** (port 5433): Primary database - `ai_scientist` db (⚠️ Note: 5433, not default 5432)
- **Kafka** (port 9092) + Zookeeper (port 2181): Event streaming
- **Redis** (port 6379): Caching with 5-min TTL
- **Prometheus** (port 9090) + Grafana (port 3000): Monitoring
- **Kafka UI** (port 8080): Manage topics/consumers
- **Redis Commander** (port 8081): Browse Redis data

## 🔄 Critical Data Flows

### Disaster Detection Pipeline
```
External APIs → data-collector (scheduled jobs)
  → PostgreSQL (metrics/earthquakes/water_levels tables)
  → Kafka (raw.* topics)
  → alert-engine (Kafka consumers)
  → PostgreSQL (alerts table)
  → Kafka (alerts.critical/warning topics)
  → alert-publisher → Cell Broadcast
```

**Key Kafka Topics:**
- `raw.spaceweather.kp` / `raw.spaceweather.cme` - Space weather events
- `raw.tsunami.warning` - High-risk earthquake events (M>=6.0, shallow, coastal)
- `raw.flood.detected` - Flood threshold breaches
- `alerts.critical` / `alerts.warning` - Processed alerts by severity

### Service Discovery Pattern
All services register with Eureka at `http://admin:admin@localhost:8761/eureka/`. Gateway routes via `lb://SERVICE-NAME` URIs (e.g., `lb://data-collector`). Check [infra/docker-compose.yml](../infra/docker-compose.yml) for complete service topology.

## 💻 Development Workflows

### Build & Run (Spring Boot Services)
```powershell
# Prerequisites: Start infrastructure first
cd infra
docker-compose up -d  # Wait for all services healthy (~30-60s)
docker-compose ps    # Verify all containers are "Up" or "Healthy"

# Build any service (from service directory)
cd {service-name}
mvn clean package -DskipTests  # Produces {service}-1.0.0-SNAPSHOT.jar

# Run with profile (default: no profile set, falls back to "default")
mvn spring-boot:run -Dspring-boot.run.profiles=local
# Or: set SPRING_PROFILES_ACTIVE=local && mvnw spring-boot:run

# Via IntelliJ IDEA: Run configuration with VM options:
# -Dspring.profiles.active=local
```

### Common Build Issues
1. **PostgreSQL password authentication failed**: Check `infra/docker-compose.yml` - password is `devpassword` (or `devpassword_change_in_production`)
2. **Java version mismatch**: 
   - data-collector requires Java 17
   - alert-engine, api-gateway require Java 21
3. **Port already in use**: PostgreSQL is on 5433 (not 5432) to avoid conflicts

### Testing Individual Services
See [alert-engine/TEST_GUIDE.md](../alert-engine/TEST_GUIDE.md) for integration test flows. Manual trigger endpoints available:
- POST `http://localhost:8082/api/v1/collector/collect/kp-index` - Trigger Kp-index collection
- POST `http://localhost:8082/api/v1/collector/collect/cme` - Trigger CME data collection
- GET `http://localhost:8083/api/v1/alerts/health` - Verify alert engine status
- GET `http://localhost:8083/api/v1/alerts` - List all alerts
- GET `http://localhost:8083/api/v1/alerts/critical` - Get critical alerts (Kp >= 7.0)

### Debugging Scheduled Jobs
All schedulers are in [DataCollectionScheduler.java](../data-collector/src/main/java/com/aiscientist/data_collector/scheduler/DataCollectionScheduler.java). Configure via `application.yml`:
```yaml
app.scheduler:
  earthquake:
    enabled: true           # Set false to disable
    cron: "0 */2 * * * *"   # Every 2 minutes
  noaa-kp:
    enabled: true
    cron: "0 */10 * * * *"  # Every 10 minutes
  nasa-cme:
    enabled: true
    cron: "0 */15 * * * *"  # Every 15 minutes
  noaa-tides:
    enabled: true
    cron: "0 */5 * * * *"   # Every 5 minutes
  usgs-water:
    enabled: true
    cron: "0 */10 * * * *"  # Every 10 minutes
```

**Scheduler doesn't run?** Check:
1. `@EnableScheduling` present in Application class
2. `@ConditionalOnProperty` matches your config
3. Check logs for "Scheduled task: Collecting..."

## 🎨 Code Conventions

### Java/Spring Boot Standards
- **Java Version**: 17 for most services (21 for alert-engine, infrastructure)
- **Spring Boot**: 3.2.5 + Spring Cloud 2023.0.1
- **Layer Pattern**: `@RestController` → `@Service` → `@Repository` (see grep results for examples)
- **DTO Mapping**: Use MapStruct for entity ↔ DTO conversion
- **Exception Handling**: Centralized `@RestControllerAdvice` with `ErrorResponse` DTO
- **Resilience**: `@CircuitBreaker`, `@Retry`, `@Cacheable` from Resilience4j + Spring Cache

### Kafka Event Conventions
- **Producers**: Always async with `CompletableFuture<SendResult>`, log send failures
- **Consumers**: `@KafkaListener` with explicit group-id, use try-catch logging per event
- **Serialization**: JSON with type headers (see [TsunamiConsumer.java](../alert-engine/src/main/java/com/aiscientist/alert_engine/kafka/TsunamiConsumer.java) for DTO type mapping)

### External API Integration Pattern
All external API calls (NASA, NOAA, USGS) follow this pattern in services like [NoaaApiService.java](../data-collector/src/main/java/com/aiscientist/data_collector/service/NoaaApiService.java):
1. WebClient with base URL configuration
2. `@CircuitBreaker` + `@Retry` for fault tolerance
3. `@Cacheable` with Redis (5-min default TTL)
4. Reactive streams (Flux/Mono) for processing
5. Throw `ExternalApiException` on failures

## 🔍 Finding Code Patterns

### Module Boundaries
- Data ingestion logic: `data-collector/src/main/java/com/aiscientist/data_collector/service/*ApiService.java`
- Alert detection rules: `alert-engine/src/main/java/com/aiscientist/alert_engine/service/*AlertService.java`
- Gateway routing: [api-gateway/src/main/resources/application.yml](../api-gateway/src/main/resources/application.yml) (see `spring.cloud.gateway.routes`)

### Database Schema
Initialize scripts: [infra/sql/init/](../infra/sql/init/) - Creates `metrics`, `alerts`, `earthquakes`, `water_level_metrics` tables.

### Configuration Management
- Local dev: `src/main/resources/application-local.yml` in each service
- Environment variables: Set `EUREKA_URI`, `SPRING_KAFKA_BOOTSTRAP_SERVERS` for overrides
- Secrets: Use placeholder values in dev (e.g., `devpassword`), never commit prod secrets

## 🚨 Common Pitfalls

1. **Port conflicts**: PostgreSQL uses 5433 (not 5432) to avoid conflicts - check [docker-compose.yml](../infra/docker-compose.yml#L82)
2. **Eureka registration delay**: Wait 30-60s after service start before gateway routing works
3. **Java version mismatch**: alert-engine requires Java 21, others use Java 17
   - Check via: `java -version` or set `JAVA_HOME` appropriately
4. **Scheduler timing**: Default schedules may not trigger immediately - use manual endpoints for testing
5. **Kafka consumer lag**: Check Kafka UI at http://localhost:8080 for consumer group offsets
6. **Database password**: Default dev password is `devpassword` (see `.env` in infra/)
7. **Service not registered**: Check Eureka dashboard at http://localhost:8761 (admin/admin) to verify registration
8. **Maven build fails**: Run `mvn clean install` from root to install parent POMs first (if multi-module)
9. **DevTools restart issues**: In IntelliJ, File → Settings → Build → Compiler → "Build project automatically"

## 📚 Key Documentation
- Architecture: [meta/README.md](../meta/README.md) - Repository structure & tech stack
- Infrastructure: [infra/README.md](../infra/README.md) - Docker setup & service URLs
- Deployment status: [infra/PHASE1_DEPLOYMENT_COMPLETE.md](../infra/PHASE1_DEPLOYMENT_COMPLETE.md)
- Feature docs: [data-collector/md/](../data-collector/md/) - EARTHQUAKE_MONITORING.md, FLOOD_WARNING_SYSTEM.md

## 🤖 AI Agent Context
Specialized agent roles defined in [.github/agent-docs/](agent-docs/). Reference [backend-agent.md](agent-docs/backend-agent.md) for Spring Boot patterns, [architect-agent.md](agent-docs/architect-agent.md) for system design decisions.
