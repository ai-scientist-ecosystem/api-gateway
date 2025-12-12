# API Gateway Service

**Unified entry point** for all AI Scientist Ecosystem microservices using Spring Cloud Gateway.

## 🎯 Purpose

Provides a single entry point that routes requests to appropriate backend services:
- **data-collector** (port 8082) - Data ingestion from external APIs
- **alert-engine** (port 8083) - Alert processing and management

## 🚀 Features

- ✅ **Service Discovery** - Automatic routing via Eureka
- ✅ **Load Balancing** - Distributes traffic across service instances
- ✅ **Circuit Breaker** - Resilience4j for fault tolerance
- ✅ **CORS** - Pre-configured for frontend applications
- ✅ **Rate Limiting** - IP-based request throttling
- ✅ **Request/Response Logging** - Monitoring and debugging
- ✅ **Fallback Endpoints** - Graceful degradation when services are down

## 📋 Routing Rules

### Data Collector Routes
```
GET  /api/data-collector/health          → data-collector:8082/health
GET  /api/earthquakes/recent             → data-collector:8082/api/earthquakes/recent
GET  /api/water-levels/flooding          → data-collector:8082/api/water-levels/flooding
```

### Alert Engine Routes
```
GET  /api/alerts/**                      → alert-engine:8083/api/v1/alerts/**
GET  /api/alerts/earthquakes?minMagnitude=5.0
GET  /api/alerts/tsunamis?minRiskScore=30
GET  /api/alerts/floods?stationId=USGS-12345
GET  /api/alerts/cme?minSpeed=1000
```

### Gateway Management
```
GET  /api/gateway/health                 → Gateway health check
GET  /api/gateway/services               → List all registered services
GET  /actuator/gateway/routes            → View configured routes
```

## 🏃 Running Locally

### Prerequisites
- Java 21+
- Maven 3.9+
- Eureka Server running on port 8761
- Redis running on port 6379

### Start the Gateway
```bash
cd api-gateway
mvn clean install
mvn spring-boot:run
```

### Access Points
- **Gateway**: http://localhost:8080
- **Actuator**: http://localhost:8080/actuator
- **Health**: http://localhost:8080/api/gateway/health
- **Services**: http://localhost:8080/api/gateway/services

## 🔧 Configuration

### Environment Variables
```bash
# Eureka Server
EUREKA_URI=http://admin:admin@localhost:8761/eureka/

# Service Ports (auto-discovered via Eureka)
# No need to configure if services register properly
```

### Circuit Breaker Settings
- **Sliding Window**: 10 requests
- **Failure Threshold**: 50%
- **Wait Duration**: 10 seconds
- **Half-Open Calls**: 3

## 🧪 Testing

### Test Data Collector Route
```bash
# Via Gateway
curl http://localhost:8080/api/earthquakes/recent

# Direct (bypass gateway)
curl http://localhost:8082/api/earthquakes/recent
```

### Test Alert Engine Route
```bash
# Via Gateway
curl "http://localhost:8080/api/alerts/earthquakes?minMagnitude=5.0"

# Direct (bypass gateway)
curl "http://localhost:8083/api/v1/alerts/earthquakes?minMagnitude=5.0"
```

### Test Circuit Breaker
```bash
# Stop data-collector service
# Try accessing endpoint - should get fallback response
curl http://localhost:8080/api/data-collector/health

# Expected Response:
{
  "status": "SERVICE_UNAVAILABLE",
  "message": "Data Collector service is temporarily unavailable...",
  "timestamp": "2025-12-12T...",
  "service": "data-collector"
}
```

## 📊 Monitoring

### View Routes
```bash
curl http://localhost:8080/actuator/gateway/routes | jq
```

### View Registered Services
```bash
curl http://localhost:8080/api/gateway/services | jq
```

### Health Check
```bash
curl http://localhost:8080/actuator/health | jq
```

## 🔒 Security (TODO - Phase 3)

Future enhancements:
- [ ] JWT authentication
- [ ] API key validation
- [ ] OAuth2 integration
- [ ] Request signing
- [ ] mTLS for service-to-service

## 🐛 Troubleshooting

### Gateway not finding services
```bash
# Check Eureka registration
curl http://admin:admin@localhost:8761/eureka/apps

# Check gateway logs
tail -f logs/api-gateway.log
```

### Circuit breaker always open
- Check service health endpoints
- Verify failure rate threshold
- Review circuit breaker metrics in actuator

### CORS issues
- Check `globalcors` configuration in application.yml
- Verify allowed origins include your frontend URL

## 📚 References

- [Spring Cloud Gateway Docs](https://spring.io/projects/spring-cloud-gateway)
- [Resilience4j Circuit Breaker](https://resilience4j.readme.io/docs/circuitbreaker)
- [Eureka Service Discovery](https://spring.io/guides/gs/service-registration-and-discovery)
