# Telemetry System Design

**Version:** 1.0  
**Created:** 2026-02-24  
**Author:** Sub-agent p3-3 (Proactive Job System Enhancement)  
**Status:** Design Complete  

---

## Executive Summary

This document defines a comprehensive telemetry system for the Clawdbot gateway and scheduler infrastructure. The system is built on the three pillars of observability: **Metrics**, **Logs**, and **Traces**. It provides visibility into system health, task execution, agent performance, and resource utilization.

The telemetry system integrates with the existing architecture documented in [GATEWAY-ARCHITECTURE.md](./GATEWAY-ARCHITECTURE.md) and extends the monitoring capabilities to enable proactive alerting, performance optimization, and capacity planning.

### Key Goals

1. **Visibility** — Complete insight into system operations
2. **Debugging** — Fast root cause analysis for failures
3. **Performance** — Identify bottlenecks and optimization opportunities
4. **Alerting** — Proactive notification of issues
5. **Capacity Planning** — Data-driven scaling decisions

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Metrics Collection](#metrics-collection)
3. [Logging System](#logging-system)
4. [Distributed Tracing](#distributed-tracing)
5. [Collection Points](#collection-points)
6. [Key Performance Indicators](#key-performance-indicators)
7. [Alerting & Notifications](#alerting--notifications)
8. [Dashboard & Visualization](#dashboard--visualization)
9. [Implementation Plan](#implementation-plan)
10. [Technical Reference](#technical-reference)

---

## Architecture Overview

### High-Level Telemetry Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TELEMETRY SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         COLLECTION LAYER                            │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │   │
│  │  │ Gateway │  │  Cron   │  │ Session │  │  Spawn  │  │  Inbox  │   │   │
│  │  │ Metrics │  │ Metrics │  │ Metrics │  │ Metrics │  │ Metrics │   │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │   │
│  │       │            │            │            │            │         │   │
│  │       └────────────┴────────────┼────────────┴────────────┘         │   │
│  │                                 │                                   │   │
│  └─────────────────────────────────┼───────────────────────────────────┘   │
│                                    │                                       │
│  ┌─────────────────────────────────┼───────────────────────────────────┐   │
│  │                     PROCESSING LAYER                                │   │
│  │  ┌──────────────┐  ┌───────────┴───────────┐  ┌──────────────┐     │   │
│  │  │   Metrics    │  │    Structured Logs    │  │    Traces    │     │   │
│  │  │  Aggregator  │  │       Processor       │  │   Collector  │     │   │
│  │  └──────┬───────┘  └───────────┬───────────┘  └──────┬───────┘     │   │
│  │         │                      │                      │             │   │
│  │         └──────────────────────┼──────────────────────┘             │   │
│  │                                │                                    │   │
│  └────────────────────────────────┼────────────────────────────────────┘   │
│                                   │                                        │
│  ┌────────────────────────────────┼────────────────────────────────────┐   │
│  │                      STORAGE LAYER                                   │   │
│  │  ┌──────────────┐  ┌───────────┴───────────┐  ┌──────────────┐      │   │
│  │  │   Metrics    │  │      Log Store        │  │    Trace     │      │   │
│  │  │    Store     │  │   (JSON files/DB)     │  │    Store     │      │   │
│  │  │  (time-ser)  │  │                       │  │              │      │   │
│  │  └──────────────┘  └───────────────────────┘  └──────────────┘      │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                   │                                        │
│  ┌────────────────────────────────┼────────────────────────────────────┐   │
│  │                   PRESENTATION LAYER                                 │   │
│  │  ┌──────────────┐  ┌───────────┴───────────┐  ┌──────────────┐      │   │
│  │  │  Dashboard   │  │     Alert Engine      │  │   Reports    │      │   │
│  │  │  (Real-time) │  │   (Thresholds/Notif)  │  │  (Periodic)  │      │   │
│  │  └──────────────┘  └───────────────────────┘  └──────────────┘      │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Lightweight** — Minimal overhead on production systems
2. **Consistent** — Uniform naming conventions and formats
3. **Extensible** — Easy to add new metrics and collection points
4. **Queryable** — Support for ad-hoc analysis
5. **Actionable** — Every metric should inform a decision

---

## Metrics Collection

### Metric Types

| Type | Description | Example |
|------|-------------|---------|
| **Counter** | Monotonically increasing value | `gateway_requests_total` |
| **Gauge** | Point-in-time value | `gateway_active_sessions` |
| **Histogram** | Distribution of values | `task_latency_seconds` |
| **Summary** | Aggregated statistics | `spawn_queue_wait_p99` |

### Gateway Metrics

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `gateway_requests_total` | Counter | Total requests received | `method`, `status` |
| `gateway_request_latency_seconds` | Histogram | Request processing time | `method` |
| `gateway_throughput_requests_per_second` | Gauge | Requests per second (rolling 1m) | - |
| `gateway_active_connections` | Gauge | Current WebSocket connections | - |
| `gateway_errors_total` | Counter | Total errors | `error_type` |
| `gateway_uptime_seconds` | Gauge | Time since start | - |
| `gateway_memory_bytes` | Gauge | Memory usage | `type` |
| `gateway_cpu_percent` | Gauge | CPU utilization | - |

### Scheduler Metrics

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `scheduler_jobs_total` | Counter | Total jobs executed | `job_name`, `status` |
| `scheduler_job_latency_seconds` | Histogram | Job execution time | `job_name` |
| `scheduler_job_errors_total` | Counter | Job failures | `job_name`, `error_type` |
| `scheduler_jobs_active` | Gauge | Currently running jobs | - |
| `scheduler_next_run_seconds` | Gauge | Time to next scheduled run | `job_name` |

### Agent Session Metrics

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `session_total` | Counter | Total sessions created | `type`, `model` |
| `session_active` | Gauge | Active sessions | `type` |
| `session_duration_seconds` | Histogram | Session lifetime | `type`, `model` |
| `session_tokens_used` | Counter | API tokens consumed | `model` |
| `session_tool_calls_total` | Counter | Tool invocations | `tool_name` |
| `session_errors_total` | Counter | Session errors | `error_type` |

### Task Completion Metrics

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `task_completion_total` | Counter | Tasks completed | `status`, `phase` |
| `task_completion_rate` | Gauge | Completion rate (24h rolling) | - |
| `task_duration_seconds` | Histogram | Time to complete task | `phase` |
| `task_validation_passes` | Counter | Validation successes | `layer` |
| `task_validation_failures` | Counter | Validation failures | `layer`, `reason` |

### Spawn Queue Metrics

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `spawn_queue_depth` | Gauge | Pending spawn requests | - |
| `spawn_queue_latency_seconds` | Histogram | Request to spawn time | - |
| `spawn_requests_total` | Counter | Total spawn requests | `status` |
| `spawn_subagent_active` | Gauge | Active sub-agents | `model` |
| `spawn_subagent_total` | Counter | Total sub-agents spawned | `model` |

### Heartbeat Metrics

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `heartbeat_active` | Gauge | Active heartbeats | - |
| `heartbeat_stale_total` | Counter | Stale heartbeats detected | - |
| `heartbeat_age_seconds` | Histogram | Heartbeat ages | `task_id` |

### Resource Utilization Metrics

| Metric Name | Type | Description | Labels |
|-------------|------|-------------|--------|
| `resource_memory_used_bytes` | Gauge | Process memory usage | `process` |
| `resource_cpu_percent` | Gauge | CPU utilization | `process` |
| `resource_disk_used_bytes` | Gauge | Disk space used | `path` |
| `resource_disk_free_bytes` | Gauge | Disk space free | `path` |

---

## Logging System

### Log Levels

| Level | Value | Usage |
|-------|-------|-------|
| `DEBUG` | 10 | Detailed debugging information |
| `INFO` | 20 | General operational events |
| `WARN` | 30 | Warning conditions |
| `ERROR` | 40 | Error conditions |
| `FATAL` | 50 | System-critical failures |

### Structured Log Format

All logs use JSON format for consistency and queryability:

```json
{
  "timestamp": "2026-02-24T23:30:00.000Z",
  "level": "INFO",
  "component": "gateway",
  "message": "Request completed",
  "correlation_id": "req-abc123",
  "trace_id": "trace-xyz789",
  "request_id": "req-001",
  "session_id": "agent:main:cron:uuid",
  "duration_ms": 150,
  "metadata": {
    "method": "agentTurn",
    "status": "success"
  }
}
```

### Log Categories

| Category | Component | Examples |
|----------|-----------|----------|
| `gateway` | Gateway Service | Connection events, request/response |
| `scheduler` | Cron System | Job execution, scheduling decisions |
| `session` | Agent Runtime | Session lifecycle, tool calls |
| `spawn` | Spawn Queue | Spawn requests, processing |
| `inbox` | Communication | Message routing, delivery |
| `validation` | 3-Layer System | Validation results |
| `heartbeat` | Health Monitoring | Heartbeat updates, stale detection |

### Log Retention Policy

| Log Type | Retention | Storage |
|----------|-----------|---------|
| **DEBUG** | 24 hours | `/tmp/moltbot/debug/` |
| **INFO** | 7 days | `/tmp/moltbot/` |
| **WARN/ERROR** | 30 days | `~/clawd/memory/logs/` |
| **FATAL** | 90 days | `~/clawd/memory/logs/archive/` |
| **Audit** | 1 year | `~/clawd/memory/logs/audit/` |

### Log Rotation

- **Daily rotation** at midnight (UTC)
- **Size-based rotation** at 100MB per file
- **Compression** of rotated files (gzip)
- **Automatic cleanup** based on retention policy

---

## Distributed Tracing

### Trace Context

Every operation includes trace context for correlation:

```
trace_id: Unique identifier for the entire request flow
span_id: Identifier for a single operation
parent_span_id: Link to parent operation
correlation_id: User-facing request identifier
```

### Span Categories

| Span Type | Description | Captured Data |
|-----------|-------------|---------------|
| `request` | Incoming request | Method, headers, body summary |
| `session` | Agent session | Model, tokens, duration |
| `tool_call` | Tool invocation | Tool name, params, result |
| `spawn` | Sub-agent spawn | Label, model, task summary |
| `message` | Inbox message | From, to, type |
| `validation` | Validation check | Layer, result, evidence |

### Trace Sampling

| Environment | Sample Rate | Reason |
|-------------|-------------|--------|
| Development | 100% | Full visibility for debugging |
| Production | 10% | Balance visibility vs. overhead |
| Error cases | 100% | Always capture error traces |

---

## Collection Points

### 1. Gateway Collection Point

**Location:** `WebSocket Server @ port 18789`

**Events Captured:**
- Connection open/close
- Request received/completed
- Error occurred
- Authentication events

**Implementation:**
```javascript
// Pseudo-code for gateway instrumentation
gateway.on('request', (req) => {
  metrics.increment('gateway_requests_total', { method: req.method });
  const span = tracer.startSpan('gateway.request', { trace_id: req.traceId });
  // ... process request
  span.end({ status: result.status, duration_ms: elapsed });
});
```

### 2. Scheduler/Cron Collection Point

**Location:** `Internal Cron Engine`

**Events Captured:**
- Job scheduled/triggered
- Job completed/failed
- Schedule modifications

**Key Metrics:**
- Jobs per hour by name
- Average job duration
- Failure rate trend

### 3. Agent Session Collection Point

**Location:** `Agent Runtime`

**Events Captured:**
- Session created/terminated
- Tool calls (with params/results)
- Token usage
- Context loading

**Key Metrics:**
- Sessions per model
- Average session duration
- Token consumption rate

### 4. Spawn Queue Collection Point

**Location:** `~/clawd/scheduler/spawn-queue/`

**Events Captured:**
- Request created
- Request picked up for processing
- Spawn completed/failed
- Queue depth changes

**Key Metrics:**
- Queue latency (request → spawn)
- Queue depth over time
- Spawn success rate

### 5. Inbox/Communication Collection Point

**Location:** `~/clawd/scheduler/inboxes/`

**Events Captured:**
- Message created
- Message delivered
- Message archived
- Delivery failures

**Key Metrics:**
- Messages per agent pair
- Average delivery latency
- Undelivered message count

### 6. Heartbeat Collection Point

**Location:** `~/clawd/scheduler/heartbeats/`

**Events Captured:**
- Heartbeat created/updated
- Heartbeat became stale
- Heartbeat removed

**Key Metrics:**
- Active heartbeat count
- Stale detection rate
- Average heartbeat age

---

## Key Performance Indicators

### System Health KPIs

| KPI | Target | Threshold | Alert Condition |
|-----|--------|-----------|-----------------|
| Gateway Uptime | 99.9% | 99.5% | Uptime < 99.5% in 24h |
| Request Success Rate | 99% | 95% | Error rate > 5% in 1h |
| Average Latency | <500ms | <1000ms | P95 latency > 1s |
| Active Sessions | <12 | <16 | Sessions > concurrency limit |

### Task Execution KPIs

| KPI | Target | Threshold | Alert Condition |
|-----|--------|-----------|-----------------|
| Task Completion Rate | 90% | 80% | Rate < 80% in 24h |
| Validation Pass Rate | 95% | 85% | Pass rate < 85% |
| Stale Task Rate | <5% | <10% | Stale > 10% of active |
| Spawn Latency | <30s | <60s | P95 > 60s |

### Resource KPIs

| KPI | Target | Threshold | Alert Condition |
|-----|--------|-----------|-----------------|
| Memory Usage | <70% | <85% | Memory > 85% |
| CPU Usage | <50% | <80% | CPU > 80% sustained |
| Disk Usage | <70% | <90% | Disk > 90% |
| Token Budget | Within budget | <110% | Over budget by >10% |

### Operational KPIs

| KPI | Target | Threshold | Alert Condition |
|-----|--------|-----------|-----------------|
| Queue Depth | <5 | <20 | Queue depth > 20 |
| Heartbeat Health | 100% current | <20% stale | >20% stale heartbeats |
| Message Delivery | <1s | <5s | Delivery > 5s |

---

## Alerting & Notifications

### Alert Severity Levels

| Level | Response Time | Notification Channel |
|-------|---------------|---------------------|
| **CRITICAL** | Immediate | Slack DM + email |
| **WARNING** | <15 minutes | Slack #aibot-chat |
| **INFO** | <1 hour | Log only |

### Alert Rules

```yaml
# Critical Alerts
- name: GatewayDown
  condition: gateway_uptime_seconds == 0 for 30s
  severity: CRITICAL
  message: "Gateway is down! Requires immediate attention."

- name: HighErrorRate
  condition: rate(gateway_errors_total[5m]) > 0.05
  severity: CRITICAL
  message: "Error rate exceeds 5% over 5 minutes."

# Warning Alerts
- name: HighLatency
  condition: histogram_quantile(0.95, task_latency_seconds) > 60
  severity: WARNING
  message: "P95 task latency exceeds 60 seconds."

- name: QueueBacklog
  condition: spawn_queue_depth > 20 for 5m
  severity: WARNING
  message: "Spawn queue has >20 pending requests for 5+ minutes."

- name: StaleHeartbeats
  condition: heartbeat_stale_total / heartbeat_active > 0.2
  severity: WARNING
  message: "More than 20% of heartbeats are stale."

# Info Alerts
- name: HighMemoryUsage
  condition: resource_memory_used_bytes / resource_memory_total > 0.85
  severity: INFO
  message: "Memory usage exceeds 85%."
```

### Alert Routing

| Severity | Weekday (9am-6pm) | Weekday (Off-hours) | Weekend |
|----------|-------------------|---------------------|---------|
| CRITICAL | Immediate notify | Immediate notify | Immediate notify |
| WARNING | #aibot-chat | Batch (next morning) | Batch |
| INFO | Log only | Log only | Log only |

---

## Dashboard & Visualization

### Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLAWDBOT TELEMETRY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │      SYSTEM HEALTH          │  │       TASK STATUS               │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ │  │  ✓ Completed: 127              │  │
│  │  │ UP   │ │ 99%  │ │ 245ms│ │  │  ⏳ In Progress: 4              │  │
│  │  │Status│ │Uptime│ │ Lat  │ │  │  ✗ Failed: 3                   │  │
│  │  └──────┘ └──────┘ └──────┘ │  │  📋 Pending Validation: 2       │  │
│  └─────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    REQUEST LATENCY (24h)                         │   │
│  │   ms                                                             │   │
│  │  500│      ╭╮                                                    │   │
│  │  400│  ╭───╯╰╮    ╭╮                                             │   │
│  │  300│──╯      ╰────╯╰──────────────────────────────────          │   │
│  │  200│                                                             │   │
│  │  100│                                                             │   │
│  │     └────────────────────────────────────────────────────        │   │
│  │       00:00    06:00    12:00    18:00    00:00                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │    ACTIVE SESSIONS         │  │      QUEUE DEPTH                 │  │
│  │  Main: 2/4                 │  │  Spawn: 1                        │  │
│  │  Sub:  5/8                 │  │  Inbox: 3                        │  │
│  │  Cron: 1                   │  │  Processing: 0                   │  │
│  └────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    RECENT ALERTS                                 │   │
│  │  [INFO] 23:15 High memory usage (86%)                           │   │
│  │  [WARN] 22:30 Queue depth exceeded 10                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Metric Aggregation

| Metric | Aggregation Method | Rollup Period |
|--------|-------------------|---------------|
| Request count | Sum | 1 minute |
| Latency | P50, P95, P99 | 1 minute |
| Error rate | Rate | 5 minutes |
| Active sessions | Max | 1 minute |
| Queue depth | Max | 1 minute |
| Resource usage | Average | 5 minutes |

### Dashboard Summary Views

1. **Overview** — System health at a glance
2. **Tasks** — Task execution and validation status
3. **Sessions** — Agent session details and history
4. **Queues** — Spawn queue and inbox status
5. **Resources** — CPU, memory, disk utilization
6. **Alerts** — Active and recent alerts

---

## Implementation Plan

### Prerequisites

Before implementation, the following dependencies must be met:

1. **Storage backend** — JSON files or lightweight database
2. **Metric collection library** — Node.js instrumentation
3. **Log processor** — Structured log parsing
4. **Alert engine** — Rule evaluation and notification

### Phase 1: Foundation (Week 1-2)

**Objective:** Establish core telemetry infrastructure.

| Task | Description | Estimate | Dependencies |
|------|-------------|----------|--------------|
| 1.1 | Define metric naming conventions | 2h | - |
| 1.2 | Create telemetry configuration schema | 4h | 1.1 |
| 1.3 | Implement metrics collector module | 8h | 1.2 |
| 1.4 | Set up log rotation and retention | 4h | - |
| 1.5 | Create baseline metrics export | 4h | 1.3 |

**Deliverables:**
- [ ] Telemetry configuration file
- [ ] Metrics collector module
- [ ] Log management scripts
- [ ] Baseline metrics export

### Phase 2: Core Metrics (Week 3-4)

**Objective:** Instrument primary components.

| Task | Description | Estimate | Dependencies |
|------|-------------|----------|--------------|
| 2.1 | Instrument Gateway with metrics | 8h | Phase 1 |
| 2.2 | Instrument Scheduler with metrics | 6h | Phase 1 |
| 2.3 | Add session metrics | 6h | Phase 1 |
| 2.4 | Add spawn queue metrics | 4h | Phase 1 |
| 2.5 | Add heartbeat metrics | 4h | Phase 1 |

**Deliverables:**
- [ ] Gateway instrumentation
- [ ] Scheduler instrumentation
- [ ] Session tracking
- [ ] Queue monitoring

### Phase 3: Alerting (Week 5-6)

**Objective:** Implement alerting system.

| Task | Description | Estimate | Dependencies |
|------|-------------|----------|--------------|
| 3.1 | Design alert rule engine | 4h | Phase 2 |
| 3.2 | Implement threshold evaluation | 6h | 3.1 |
| 3.3 | Create notification integration | 4h | 3.2 |
| 3.4 | Configure alert rules | 4h | 3.3 |
| 3.5 | Test alert scenarios | 4h | 3.4 |

**Deliverables:**
- [ ] Alert rule engine
- [ ] Notification system
- [ ] Configured alert rules
- [ ] Alert testing documentation

### Phase 4: Visualization (Week 7-8)

**Objective:** Build dashboards and reporting.

| Task | Description | Estimate | Dependencies |
|------|-------------|----------|--------------|
| 4.1 | Design dashboard layout | 4h | Phase 2 |
| 4.2 | Implement metric aggregation | 6h | 4.1 |
| 4.3 | Create real-time dashboard | 12h | 4.2 |
| 4.4 | Implement historical reports | 6h | 4.2 |
| 4.5 | Add export capabilities | 4h | 4.3, 4.4 |

**Deliverables:**
- [ ] Real-time dashboard
- [ ] Historical reporting
- [ ] Export functionality

### Timeline Summary

```
Week 1-2:  [=======] Phase 1: Foundation
Week 3-4:  [=======] Phase 2: Core Metrics  
Week 5-6:  [=======] Phase 3: Alerting
Week 7-8:  [=======] Phase 4: Visualization
```

### Risk Mitigation

| Risk | Mitigation | Priority |
|------|------------|----------|
| Performance overhead | Sample metrics, async collection | High |
| Storage growth | Retention limits, compression | Medium |
| False positives | Alert tuning, hysteresis | Medium |
| Missing metrics | Regular review, coverage tests | Low |

---

## Technical Reference

### Metric Naming Conventions

All metrics follow a consistent naming convention:

```
{component}_{object}_{action}_{unit}
```

**Examples:**
- `gateway_requests_total` — Counter of gateway requests
- `session_duration_seconds` — Histogram of session durations
- `spawn_queue_depth` — Gauge of spawn queue size

**Rules:**
1. Use snake_case
2. Use singular nouns
3. Include unit suffix (`_total`, `_seconds`, `_bytes`)
4. Prefix with component name

### Label Standards

| Label | Description | Values |
|-------|-------------|--------|
| `status` | Operation result | `success`, `failure`, `timeout` |
| `method` | Request method | `agentTurn`, `spawn`, etc. |
| `model` | AI model | `opus`, `sonnet`, `haiku` |
| `type` | Category | `main`, `cron`, `subagent` |
| `layer` | Validation layer | `L1`, `L2`, `L3` |
| `error_type` | Error category | `timeout`, `auth`, `runtime` |

### Data Retention Policy

| Data Type | Retention | Cleanup Method |
|-----------|-----------|----------------|
| Raw metrics | 7 days | Auto-expire |
| Aggregated metrics | 90 days | Auto-expire |
| Debug logs | 24 hours | Daily cleanup |
| Info/Warn logs | 7 days | Weekly cleanup |
| Error logs | 30 days | Monthly cleanup |
| Audit logs | 1 year | Annual review |

### Storage Requirements

| Component | Estimated Size/Day | 30-Day Total |
|-----------|-------------------|--------------|
| Metrics | 10 MB | 300 MB |
| Logs (info) | 50 MB | 1.5 GB |
| Logs (debug) | 200 MB | N/A (24h retention) |
| Traces | 20 MB | 600 MB |
| **Total** | ~80 MB | ~2.4 GB |

### API Reference

#### Metrics API

```javascript
// Increment counter
telemetry.increment('gateway_requests_total', { method: 'agentTurn' });

// Set gauge
telemetry.gauge('gateway_active_connections', 5);

// Record histogram
telemetry.histogram('task_latency_seconds', 1.25, { phase: 'p3' });
```

#### Logging API

```javascript
// Structured log with context
telemetry.log({
  level: 'INFO',
  component: 'scheduler',
  message: 'Job completed',
  correlation_id: 'req-123',
  metadata: { job_name: 'coordinator', duration_ms: 1500 }
});
```

#### Tracing API

```javascript
// Start span
const span = telemetry.startSpan('session.create', {
  trace_id: req.traceId,
  attributes: { model: 'opus', type: 'main' }
});

// End span
span.end({ status: 'success' });
```

---

## Integration with Existing Systems

### Gateway Architecture Integration

This telemetry system integrates directly with the components documented in [GATEWAY-ARCHITECTURE.md](./GATEWAY-ARCHITECTURE.md):

1. **Gateway Service** → Gateway metrics collection point
2. **Cron Scheduler** → Scheduler metrics collection point
3. **Session Storage** → Session metrics collection point
4. **Spawn Queue** → Spawn queue metrics collection point
5. **Inbox System** → Communication metrics collection point
6. **Heartbeat System** → Heartbeat metrics collection point

### Heartbeat System Integration

The telemetry system monitors heartbeat health:

- Tracks `heartbeat_active` gauge
- Detects stale heartbeats via `heartbeat_stale_total`
- Alerts when stale percentage exceeds threshold

### Validation System Integration

Integrates with the 3-layer validation system:

- Tracks validation passes/failures by layer
- Records validation duration
- Monitors validation queue depth

---

## Appendix

### Related Documentation

- [GATEWAY-ARCHITECTURE.md](./GATEWAY-ARCHITECTURE.md) — System architecture
- [CRON-SETUP.md](./CRON-SETUP.md) — Cron configuration
- [SESSION-LOG-ORGANIZATION.md](./SESSION-LOG-ORGANIZATION.md) — Log structure

### Glossary

| Term | Definition |
|------|------------|
| **Metric** | Numerical measurement of system behavior |
| **Gauge** | Point-in-time value that can go up or down |
| **Counter** | Monotonically increasing value |
| **Histogram** | Distribution of values across buckets |
| **Span** | Single operation in a distributed trace |
| **Trace** | Complete request flow across components |
| **Correlation ID** | Identifier linking related log entries |

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-24 | p3-3 | Initial comprehensive design |

---

*Document generated as part of p3-3: Implement Comprehensive Telemetry System*
