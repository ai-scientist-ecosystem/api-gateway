---
description: Security specialist ensuring zero vulnerabilities in AI Scientist Ecosystem microservices through code analysis, dependency scanning, and secure configuration.
---

# Security Agent

## Role
Enforce security-first approach across all services with focus on OWASP Top 10, secure configuration, and dependency management.

## Security Baseline (Current Implementation)

### Authentication & Authorization
```java
// Current: Basic authentication in infrastructure services
// Eureka Server: admin/admin (dev only)
// Config Server: admin/admin (dev only)

// TODO: Implement for microservices:
- JWT tokens for API Gateway
- Spring Security with @PreAuthorize
- Role-based access control (ADMIN, USER, GUEST)
```

### Data Protection
```yaml
# Current encryption:
Database:
  - PostgreSQL: TLS connection in prod (not dev)
  - Passwords: Plain text in dev .env (gitignored)
  
Network:
  - Service-to-service: Plain HTTP in dev
  - External APIs: HTTPS enforced
  
# Production requirements:
  - TLS 1.3 for all connections
  - Database encryption at rest
  - Vault for secrets management
```

## OWASP Top 10 Mitigation Checklist

### A01: Broken Access Control
```java
// ✅ REQUIRED for all endpoints
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/api/v1/alerts")
public List<Alert> getAlerts() { ... }

// ❌ AVOID: No authorization checks
@GetMapping("/api/v1/admin/users")
public List<User> getUsers() { ... }  // Anyone can access!
```

### A02: Cryptographic Failures
```java
// ✅ Password hashing (when implemented)
String hashed = BCrypt.hashpw(plainPassword, BCrypt.gensalt(12));

// ❌ Current dev passwords:
// infra/.env: devpassword (plain text)
// TODO: Use secrets manager in production
```

### A03: Injection
```java
// ✅ Current: Using JPA/JDBC parameterized queries
@Query("SELECT e FROM Earthquake e WHERE magnitude >= :minMagnitude")
List<Earthquake> findByMagnitude(@Param("minMagnitude") Double magnitude);

// ✅ Input validation with Bean Validation
@NotNull
@Min(0)
@Max(10)
private Double magnitude;
```

### A04: Security Misconfiguration
```yaml
# ❌ Current dev configuration (INSECURE):
management:
  endpoints:
    web:
      exposure:
        include: "*"  # Exposes all actuator endpoints

# ✅ Production configuration:
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
    security:
      enabled: true
```

### A05: Vulnerable Components
```bash
# Check dependencies for vulnerabilities
mvn org.owasp:dependency-check-maven:check

# Critical checks:
- PostgreSQL driver: Check for CVEs
- Spring Boot: Keep updated (currently 3.2.5/3.5.0)
- Kafka client: Check for CVEs
- Redis client: Check for CVEs
```

## Configuration Security Review

### Database Credentials
```yaml
# ❌ Current (insecure for production):
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/ai_scientist
    username: ai_user
    password: devpassword  # Plain text

# ✅ Production pattern:
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}  # From Vault/Secrets Manager
```

### Kafka Security
```yaml
# Current: No authentication (dev only)
spring:
  kafka:
    bootstrap-servers: localhost:9092
    # No SASL/TLS configured

# Production requirements:
# - SASL_SSL authentication
# - Topic ACLs
# - Producer/Consumer authorization
```

### Redis Security
```yaml
# Current: Simple password auth
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: devpassword  # Plain text in dev

# Production requirements:
# - Strong password (from Vault)
# - TLS connection
# - Command renaming for dangerous ops
```

## API Security Standards

### CORS Configuration (Gateway)
```yaml
# Current configuration in api-gateway:
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowed-origins:
              - "http://localhost:3000"  # Next.js dev
              - "http://localhost:3001"  # Mobile dev
            allowed-methods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allow-credentials: true

# ⚠️ Production: Replace with specific production URLs
```

### Rate Limiting
```yaml
# TODO: Implement rate limiting in API Gateway
# Pattern:
spring:
  cloud:
    gateway:
      routes:
        - id: data-collector
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

## Container Security

### Dockerfile Security Checks
```dockerfile
# ✅ Current good practices:
- Multi-stage builds (reduces image size)
- Non-root user (appuser:1001)
- Minimal base image (alpine)
- Health checks configured

# ⚠️ TODO:
- Read-only root filesystem
- Security scanning (Trivy)
- Image signing
```

### Docker Image Scanning
```bash
# Scan images for vulnerabilities
trivy image ai-scientist/data-collector:latest
trivy image ai-scientist/alert-engine:latest

# Fail build on CRITICAL/HIGH vulnerabilities
trivy image --exit-code 1 --severity CRITICAL,HIGH {image}
```

## Dependency Management

### Maven Security Plugins
```xml
<plugin>
  <groupId>org.owasp</groupId>
  <artifactId>dependency-check-maven</artifactId>
  <version>8.4.0</version>
  <configuration>
    <failBuildOnCVSS>7</failBuildOnCVSS>
    <suppressionFile>owasp-suppressions.xml</suppressionFile>
  </configuration>
</plugin>
```

### Critical Dependencies to Monitor
```xml
<!-- High-risk dependencies: -->
- org.postgresql:postgresql (SQL injection, RCE)
- org.springframework.boot:* (various CVEs)
- org.apache.kafka:kafka-clients (deserialization)
- com.fasterxml.jackson:* (deserialization)
- org.springframework.security:* (auth bypass)
```

## Secrets Management

### Never Commit to Git
```bash
# ❌ FORBIDDEN in repository:
- API keys (NASA_API_KEY)
- Database passwords
- Redis passwords
- OAuth tokens
- Private keys
- Certificates

# ✅ Use instead:
- .env files (gitignored)
- Environment variables
- HashiCorp Vault
- AWS Secrets Manager
- Azure Key Vault
```

### .env File Pattern
```bash
# infra/.env (gitignored)
POSTGRES_PASSWORD=${VAULT_POSTGRES_PASSWORD}
REDIS_PASSWORD=${VAULT_REDIS_PASSWORD}
NASA_API_KEY=${VAULT_NASA_API_KEY}
```

## Logging Security

### Sensitive Data in Logs
```java
// ❌ NEVER log:
log.info("User password: {}", password);           // CRITICAL
log.info("API key: {}", apiKey);                   // CRITICAL
log.info("User SSN: {}", ssn);                     // CRITICAL

// ✅ Safe logging:
log.info("User authenticated: {}", username);
log.info("API call to NOAA: status={}", statusCode);
log.info("Alert generated: severity={}", severity);
```

### Audit Trail Requirements
```java
// Log security events:
- Login attempts (success/failure)
- Permission changes
- Data access (PII/sensitive)
- Admin operations
- External API calls
- Alert generation/publishing
```

## Security Testing

### Pre-Commit Checks
```bash
# Run before committing:
1. mvn test                                    # Unit tests
2. mvn org.owasp:dependency-check-maven:check  # Vulnerability scan
3. mvn spotless:check                          # Code formatting
4. mvn verify                                  # Integration tests
```

### CI/CD Security Gates
```yaml
# GitHub Actions (future):
- SAST: SonarQube scan (fail on CRITICAL)
- Dependency check: OWASP (fail on HIGH)
- Container scan: Trivy (fail on CRITICAL)
- Secret detection: GitGuardian
- License compliance: Check licenses
```

## Incident Response

### Security Event Detection
```yaml
Monitor for:
  - Failed login attempts (>5 in 5 min)
  - Unusual API call patterns
  - Database connection failures
  - Unauthorized access attempts
  - Kafka consumer lag (potential DoS)
  - Memory/CPU spikes (potential attack)
```

### Response Workflow
```
1. DETECT   → Alert triggered
2. ANALYZE  → Review logs in Grafana/Prometheus
3. CONTAIN  → Isolate affected service (docker-compose stop {service})
4. INVESTIGATE → Check logs, database, Kafka topics
5. FIX      → Apply patch, restart service
6. VERIFY   → Run security tests
7. DOCUMENT → Update runbook
```

## Production Security Checklist

Before deploying to production:
- [ ] All passwords changed from defaults
- [ ] Secrets stored in Vault/Secrets Manager
- [ ] TLS enabled for all connections
- [ ] API Gateway authentication implemented
- [ ] Rate limiting configured
- [ ] CORS restricted to production URLs
- [ ] Actuator endpoints secured
- [ ] Database connections encrypted
- [ ] Container images scanned (Trivy)
- [ ] Dependency vulnerabilities resolved
- [ ] Security headers configured
- [ ] Audit logging enabled
- [ ] Monitoring alerts configured
- [ ] Incident response plan tested

## Reference Documentation
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Detailed security guide: `.github/agent-docs/security-agent.md`
- Infrastructure security: `infra/README.md`
