# VS Code Copilot Custom Agents

Custom agents for AI Scientist Ecosystem development. These agents understand project-specific patterns and guide AI coding assistants to follow established conventions.

## 🤖 Available Agents

| Agent | File | Use When |
|-------|------|----------|
| **Backend** | `@backend.agent` | Building Spring Boot microservices, Kafka integration, external APIs |
| **Architect** | `@architect.agent` | Designing services, API contracts, event schemas, database design |
| **DevOps** | `@devops.agent` | Infrastructure issues, Docker troubleshooting, monitoring setup |
| **Security** | `@security.agent` | Security reviews, OWASP compliance, dependency scanning |
| **Master** | `@master.agent` | Coordinating multiple agents, complex features, quality gates |

## 🚀 Quick Start

### Using in VS Code Copilot Chat

**Simple query:**
```
@backend.agent: How do I add a new external API integration?
```

**Complex feature:**
```
@master.agent: Add volcanic eruption monitoring feature
- Data source: USGS Volcano API
- Alert when: Eruption detected
- Deliver via: Cell Broadcast
```

**Troubleshooting:**
```
@devops.agent: PostgreSQL connection failed with "password authentication failed"
```

**Security review:**
```
@security.agent: Review this new REST endpoint for security issues
```

## 📖 Agent Capabilities

### @backend.agent
**Knows:**
- Spring Boot project structure (data-collector, alert-engine, api-gateway)
- External API patterns: `@CircuitBreaker` + `@Retry` + `@Cacheable`
- Kafka producer/consumer implementation
- Scheduler configuration with `@ConditionalOnProperty`
- MapStruct DTO mapping patterns

**Example tasks:**
- Implement new REST endpoint
- Add Kafka topic consumer
- Integrate external API (NASA/NOAA/USGS)
- Fix scheduler not running
- Add database entity and repository

### @architect.agent
**Knows:**
- Service boundaries (data-collector vs alert-engine)
- Kafka topic naming: `raw.{category}.{type}`, `alerts.{severity}`
- Event-driven architecture patterns
- Database per service strategy
- API Gateway routing rules

**Example tasks:**
- Design new microservice
- Define event schemas
- Plan database schema
- Review service integration
- Make architectural decisions

### @devops.agent
**Knows:**
- Docker Compose infrastructure (Eureka, Config Server, PostgreSQL, Kafka, Redis)
- Port mappings (PostgreSQL:5433, Kafka:9092, Eureka:8761)
- Monitoring stack (Prometheus, Grafana)
- Common troubleshooting scenarios
- Build and deployment workflows

**Example tasks:**
- Debug service startup issues
- Fix Eureka registration problems
- Check Kafka consumer lag
- Resolve PostgreSQL connection errors
- Setup monitoring dashboards

### @security.agent
**Knows:**
- OWASP Top 10 in context of this project
- Current security gaps (dev passwords, no JWT)
- Dependency vulnerability scanning
- Configuration security review
- Secrets management requirements

**Example tasks:**
- Review code for security issues
- Check dependency vulnerabilities
- Audit endpoint authorization
- Validate input sanitization
- Review production security checklist

### @master.agent
**Coordinates:**
- Multiple agents for complex features
- Quality gate enforcement
- Conflict resolution between agents
- Progress tracking
- Production readiness validation

**Example tasks:**
- Plan multi-service feature
- Coordinate deployment across services
- Resolve agent conflicts
- Validate production readiness
- Orchestrate bug fix workflow

## 💡 Usage Patterns

### Pattern 1: Simple Question
```
@backend.agent: What's the pattern for Kafka consumers in this project?
```
**Result:** Gets specific pattern from alert-engine with code example

### Pattern 2: Implementation Task
```
@backend.agent: Implement CME speed threshold alert
- Service: alert-engine
- Input: raw.spaceweather.cme topic
- Rule: Alert if speed > 1000 km/s
- Output: alerts.warning topic
```
**Result:** Gets full implementation following project patterns

### Pattern 3: Troubleshooting
```
@devops.agent: Alert engine not consuming Kafka messages
Current state:
- Service running on port 8083
- Kafka UI shows messages in topic
- Consumer group shows no activity
```
**Result:** Diagnostic steps and specific fix

### Pattern 4: Complex Feature (Use Master)
```
@master.agent: Add tsunami warning system
Requirements:
- Monitor earthquakes M≥6.0
- Check coastal proximity
- Calculate tsunami risk
- Send Cell Broadcast alerts
```
**Result:** Master coordinates @architect → @backend → @security → @devops

### Pattern 5: Security Review
```
@security.agent: Production deployment checklist
Services: data-collector, alert-engine, api-gateway
Environment: Azure Kubernetes Service
```
**Result:** Specific security checks for this project

## 🎯 Best Practices

### DO:
✅ **Be specific:** Provide context (service name, current state, expected outcome)
✅ **Reference files:** Mention specific files you're working with
✅ **Use master for complex tasks:** Let it coordinate other agents
✅ **Ask for patterns first:** Before implementing, understand the pattern

### DON'T:
❌ **Ask generic questions:** Agents know THIS project, use that knowledge
❌ **Skip context:** Agents work better with specific details
❌ **Mix concerns:** Use appropriate agent (@backend for code, @devops for infrastructure)
❌ **Ignore quality gates:** Follow checklist from @master.agent

## 🔄 Typical Workflows

### New Feature Development
```
1. @master.agent: Plan feature "X"
2. @architect.agent: Design API and events
3. @backend.agent: Implement in services
4. @security.agent: Security review
5. @devops.agent: Deploy and monitor
6. @master.agent: Validate quality gates
```

### Bug Fix
```
1. @devops.agent: Diagnose issue
2. @backend.agent: Implement fix
3. @security.agent: Verify no security impact
4. @devops.agent: Deploy hotfix
```

### Security Audit
```
1. @security.agent: Full security scan
2. @backend.agent: Fix code issues
3. @devops.agent: Update configuration
4. @master.agent: Validate all gates pass
```

## 📚 Reference Documentation

**For quick patterns:** Use agents (they reference actual codebase files)

**For comprehensive details:** See `.github/agent-docs/` folder
- `backend-agent.md` - Full Spring Boot guide (561 lines)
- `architect-agent.md` - Complete architecture patterns
- `devops-agent.md` - Detailed infrastructure guide
- `security-agent.md` - Full OWASP compliance guide
- `master-orchestration-agent.md` - Complete orchestration workflows

**For project setup:** See `.github/copilot-instructions.md`

## 🧪 Testing Agents

**Test if agents work:**
```
@backend.agent: What ports do our services use?
```
**Expected:** Should mention 8082, 8083, 8085, 8084

```
@devops.agent: What's special about our PostgreSQL port?
```
**Expected:** Should mention port 5433 (not default 5432)

```
@security.agent: What are our current dev passwords?
```
**Expected:** Should mention devpassword and warn about production

```
@master.agent: What agents are available?
```
**Expected:** Should list backend, architect, devops, security

## ⚠️ Important Notes

1. **Agents require VS Code Copilot Chat** - Won't work in inline suggestions
2. **Agents are context-aware** - They know the project structure
3. **Agents reference real files** - They point to actual code examples
4. **Master coordinates others** - Use for multi-step tasks
5. **Restart VS Code** - If agents don't appear after creation

## 🆘 Troubleshooting

**Agent not found:**
- Ensure file ends with `.agent.md`
- Restart VS Code
- Check YAML frontmatter format

**Agent gives generic answers:**
- Provide more context (service name, file path)
- Reference specific project patterns
- Use master agent for coordination

**Need more details:**
- Check comprehensive docs in `.github/ai-agents/`
- Reference project docs in `meta/`, `infra/`
- Look at actual implementation files

---

**Pro tip:** Start with `@master.agent` for complex tasks. It will coordinate the right agents automatically! 🚀
