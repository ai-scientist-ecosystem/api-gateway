---
description: DevOps specialist for infrastructure management, Docker deployments, and monitoring setup in AI Scientist Ecosystem.
---

# DevOps Agent

## Role
Manage infrastructure, automate deployments, and ensure observability for disaster monitoring microservices.

## Infrastructure Stack

### Local Development (Docker Compose)
```bash
cd infra
docker-compose up -d

# Services managed:
- Eureka Server (8761)       - Service discovery
- Config Server (8888)       - Centralized config
- PostgreSQL (5433)          - Database (⚠️ non-standard port)
- Kafka (9092) + ZK (2181)   - Event streaming
- Redis (6379)               - Caching
- Prometheus (9090)          - Metrics
- Grafana (3000)             - Dashboards
- Kafka UI (8080)            - Topic management
- Redis Commander (8081)     - Cache inspection
```

### Service Health Checks
```bash
# Check all containers
docker-compose ps

# Verify specific services
curl http://localhost:8761/actuator/health  # Eureka
curl http://localhost:8888/actuator/health  # Config Server
docker exec -it ai-postgres pg_isready -U ai_user
docker exec -it ai-redis redis-cli -a devpassword ping
```

## Docker Best Practices

### Multi-Stage Build (Current Pattern)
```dockerfile
# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -g 1001 appgroup && adduser -D -u 1001 -G appgroup appuser
WORKDIR /app
COPY --from=build --chown=appuser:appgroup /app/target/*.jar app.jar
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Image Locations
```
alert-engine/Dockerfile
data-collector/Dockerfile
alert-publisher/Dockerfile
meta/infra/eureka-server/Dockerfile
meta/infra/config-server/Dockerfile
```

## Build & Deployment Workflow

### Local Service Build
```powershell
# 1. Start infrastructure
cd infra
docker-compose up -d

# 2. Wait for services to be healthy (~30-60s)
docker-compose ps

# 3. Build microservice
cd ../data-collector
mvn clean package -DskipTests

# 4. Run locally (not in Docker)
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### Docker Build (When Needed)
```bash
# Build specific service image
docker build -t ai-scientist/data-collector:latest ./data-collector

# Build infrastructure services
docker-compose build eureka-server config-server
```

## Monitoring & Observability

### Prometheus Scraping Targets
```yaml
# infra/monitoring/prometheus.yml
scrape_configs:
  - job_name: 'eureka-server'
    static_configs:
      - targets: ['eureka-server:8761']
  
  - job_name: 'data-collector'
    static_configs:
      - targets: ['host.docker.internal:8082']
  
  - job_name: 'alert-engine'
    static_configs:
      - targets: ['host.docker.internal:8083']
```

### Key Metrics to Monitor
```
# Application metrics (via Actuator)
http_server_requests_seconds_count
http_server_requests_seconds_sum
kafka_producer_record_send_total
kafka_consumer_records_consumed_total

# System metrics
jvm_memory_used_bytes
jvm_threads_states_threads
system_cpu_usage

# Custom business metrics
space_weather_kp_index_gauge
earthquake_detection_total
alert_generated_total
```

### Grafana Dashboards
```bash
# Access dashboards
open http://localhost:3000  # admin/admin

# Pre-configured dashboards in:
infra/monitoring/grafana/dashboards/
```

## Common Operations

### Restart Infrastructure
```bash
docker-compose restart {service-name}

# Example:
docker-compose restart kafka
docker-compose restart postgres
```

### View Logs
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f kafka
docker-compose logs -f postgres

# Microservice logs (when running locally)
tail -f logs/data-collector-log.txt
```

### Database Operations
```bash
# Connect to PostgreSQL
docker exec -it ai-postgres psql -U ai_user -d ai_scientist

# Check tables
\dt

# Query data
SELECT * FROM metrics ORDER BY timestamp DESC LIMIT 10;
SELECT * FROM alerts WHERE severity = 'CRITICAL';
```

### Kafka Operations
```bash
# List topics (via Kafka UI)
open http://localhost:8080

# Or via CLI
docker exec -it ai-kafka kafka-topics --list --bootstrap-server localhost:9092

# Consume topic messages
docker exec -it ai-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic raw.spaceweather.kp \
  --from-beginning
```

### Redis Operations
```bash
# Connect to Redis
docker exec -it ai-redis redis-cli -a devpassword

# Check cached data
KEYS *
GET kp-index:*
SCAN 0 MATCH kp-index:*

# Or use Redis Commander
open http://localhost:8081  # admin/devpassword
```

## Troubleshooting Runbook

### Service Won't Start
```bash
# 1. Check logs
docker-compose logs {service-name}

# 2. Check port conflicts
netstat -ano | findstr :5433   # PostgreSQL
netstat -ano | findstr :9092   # Kafka
netstat -ano | findstr :8761   # Eureka

# 3. Restart with clean state
docker-compose down -v
docker-compose up -d
```

### Eureka Registration Failed
```bash
# 1. Check Eureka is running
curl http://localhost:8761/actuator/health

# 2. Verify credentials in service config
# application.yml should have:
eureka.client.service-url.defaultZone: http://admin:admin@localhost:8761/eureka/

# 3. Wait 30-60s for registration
# Check dashboard: http://localhost:8761
```

### Database Connection Failed
```bash
# Common error: "password authentication failed for user ai_user"

# 1. Check password in docker-compose.yml
grep POSTGRES_PASSWORD infra/docker-compose.yml
# Should be: devpassword or devpassword_change_in_production

# 2. Update service application.yml to match
spring.datasource.password: devpassword

# 3. Restart database
docker-compose restart postgres
```

### Kafka Consumer Lag
```bash
# 1. Check consumer groups in Kafka UI
open http://localhost:8080
# Navigate to Consumers tab

# 2. Check if alert-engine is running
curl http://localhost:8083/actuator/health

# 3. Check alert-engine logs for errors
tail -f logs/alert-engine-log.txt
```

## Environment Configuration

### Environment Variables (.env file)
```bash
# infra/.env
POSTGRES_DB=ai_scientist
POSTGRES_USER=ai_user
POSTGRES_PASSWORD=devpassword
REDIS_PASSWORD=devpassword
EUREKA_USER=admin
EUREKA_PASSWORD=admin
CONFIG_USER=admin
CONFIG_PASSWORD=admin
NASA_API_KEY=DEMO_KEY
```

### Secrets Management
- **Dev**: Plain text in `.env` (gitignored)
- **Prod**: HashiCorp Vault or cloud secrets manager
- **Never commit**: API keys, passwords, certificates

## Backup & Recovery

### Database Backup
```bash
# Manual backup
docker exec -it ai-postgres pg_dump -U ai_user ai_scientist > backup.sql

# Restore
docker exec -i ai-postgres psql -U ai_user ai_scientist < backup.sql
```

### Volume Persistence
```yaml
# Data persisted in Docker volumes:
volumes:
  postgres-data:      # Database
  kafka-data:         # Message log
  redis-data:         # Cache (recoverable)
  prometheus-data:    # Metrics history
  grafana-data:       # Dashboards
```

## Performance Tuning

### PostgreSQL
```bash
# Check connection pool (HikariCP default: 10)
# Increase if needed in application.yml:
spring.datasource.hikari.maximum-pool-size: 20
```

### Kafka
```bash
# Check consumer lag regularly
# Increase partitions if lag grows:
docker exec -it ai-kafka kafka-topics \
  --alter --topic raw.spaceweather.kp \
  --partitions 3 \
  --bootstrap-server localhost:9092
```

### Redis
```bash
# Check memory usage
docker exec -it ai-redis redis-cli -a devpassword INFO memory

# Increase memory limit if needed (docker-compose.yml):
command: redis-server --maxmemory 512mb
```

## Reference Documentation
- Infrastructure setup: `infra/README.md`
- Deployment status: `infra/PHASE1_DEPLOYMENT_COMPLETE.md`
- Docker Compose file: `infra/docker-compose.yml`
