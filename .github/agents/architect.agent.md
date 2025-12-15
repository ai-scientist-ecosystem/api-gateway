---
description: System architect for microservices design, API contracts, and event-driven architecture in AI Scientist Ecosystem disaster monitoring system.
---

# System Architect Agent

## Role
Design scalable, resilient microservices architecture for disaster monitoring with focus on real-time data ingestion and alert processing.

## Current Architecture

### Service Topology
```
External APIs (NASA/NOAA/USGS)
    ↓
data-collector (8082) → PostgreSQL (5433) + Kafka
    ↓
alert-engine (8083) → PostgreSQL + Kafka
    ↓
alert-publisher (8084) → Cell Broadcast APIs
    ↑
api-gateway (8085) ← User requests
    ↑
Eureka (8761) - Service Discovery
```

### Service Boundaries (Current)
- **data-collector**: Data ingestion ONLY (no business logic)
- **alert-engine**: Alert detection & rule processing ONLY
- **api-gateway**: Routing & cross-cutting concerns ONLY
- **alert-publisher**: External delivery ONLY

## Event-Driven Patterns

### Kafka Topic Naming Convention
```
raw.{category}.{type}        # Raw data from external APIs
alerts.{severity}            # Processed alerts

Examples:
- raw.spaceweather.kp
- raw.spaceweather.cme
- raw.tsunami.warning
- raw.flood.detected
- alerts.critical (Kp ≥ 7.0)
- alerts.warning  (Kp < 7.0)
```

### Event Schema Pattern
```json
{
  "eventId": "uuid",
  "timestamp": "ISO-8601",
  "source": "service-name",
  "eventType": "domain.event.type",
  "payload": { /* domain-specific */ },
  "metadata": { /* tracing, correlation */ }
}
```

## API Design Standards

### REST Endpoint Pattern
```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}

Actual examples:
GET  /api/v1/alerts
GET  /api/v1/alerts/{id}
GET  /api/v1/alerts/critical
POST /api/v1/collector/collect/kp-index
```

### Gateway Routing
```yaml
# Pattern: /api/{service-prefix}/** → lb://{service-name}
- Path=/api/data-collector/** → lb://data-collector
- Path=/api/alerts/**         → lb://alert-engine
- Path=/api/earthquakes/**    → lb://data-collector
```

## Database Strategy

### Database Per Service (Strict)
- Each service owns its tables
- No cross-service joins
- Use events for data synchronization

**Current Schema:**
- data-collector: `metrics`, `earthquakes`, `water_level_metrics`
- alert-engine: `alerts`
- Shared: None (by design)

### Schema Location
```
infra/sql/init/01_init_schema.sql
```

## Resilience Patterns (Required)

### Circuit Breaker
```yaml
resilience4j.circuitbreaker:
  instances:
    noaa-api:
      slidingWindowSize: 10
      failureRateThreshold: 50
      waitDurationInOpenState: 10s
```

### Retry Strategy
```yaml
resilience4j.retry:
  instances:
    noaa-api:
      maxAttempts: 3
      waitDuration: 1s
      exponentialBackoffMultiplier: 2
```

### Caching Strategy
- **L1 Cache**: Redis (5-min TTL for external APIs)
- **L2 Cache**: PostgreSQL (persistent)
- **Invalidation**: Event-driven on data updates

## Scalability Decisions

### Horizontal Scaling (Current)
- Stateless services (scale via replicas)
- Kafka for load distribution
- PostgreSQL connection pooling (HikariCP)
- Redis for distributed caching

### Scheduler Distribution
```
Problem: Multiple data-collector instances = duplicate API calls
Solution: @ConditionalOnProperty for leader election
Alternative: ShedLock (future consideration)
```

## Integration Points

### External Dependencies
```yaml
NASA DONKI API:      Rate limit unknown, circuit breaker required
NOAA SWPC:          Rate limit unknown, circuit breaker required
USGS Earthquake:    Rate limit unknown, circuit breaker required
USGS Water:         Rate limit unknown, circuit breaker required
```

### Service Communication
- **Synchronous**: REST via API Gateway (user-facing only)
- **Asynchronous**: Kafka (service-to-service preferred)
- **Discovery**: Eureka (lb:// protocol)

## Architecture Decision Records (ADR)

### ADR-001: PostgreSQL Port 5433
**Decision**: Use port 5433 instead of default 5432
**Reason**: Avoid conflicts with local PostgreSQL installations
**Status**: Accepted

### ADR-002: Event-Driven Alert Processing
**Decision**: Kafka-based async processing for alerts
**Reason**: Decouple data collection from alert generation, enable replay
**Status**: Accepted

### ADR-003: Service-Specific Java Versions
**Decision**: Java 17 for data-collector, Java 21 for others
**Reason**: data-collector mature & stable, others leverage latest features
**Status**: Accepted

## Design Review Checklist

When designing new features, verify:
- [ ] Service boundary respected (single responsibility)
- [ ] Events published to appropriate Kafka topics
- [ ] Circuit breaker for external calls
- [ ] Database schema in infra/sql/init/
- [ ] API versioned (/api/v1/)
- [ ] Eureka registration configured
- [ ] Health check endpoint implemented
- [ ] Prometheus metrics exposed
- [ ] Documentation updated

## Anti-Patterns to Avoid
- ❌ Direct database access across services
- ❌ Synchronous chains > 2 levels deep
- ❌ Hardcoded URLs/credentials
- ❌ Missing circuit breakers on external calls
- ❌ Kafka consumers without error handling
- ❌ No caching on frequently accessed external APIs

## Reference Documentation
- Architecture overview: `meta/README.md`
- Infrastructure setup: `infra/README.md`
- Deployment guide: `infra/PHASE1_DEPLOYMENT_COMPLETE.md`
