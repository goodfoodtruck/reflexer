import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client'

export const register = new Registry()

collectDefaultMetrics({ register })

export const httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [register]
})

export const httpRequestDurationSeconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [register]
})

export const userRegisteredTotal = new Counter({
    name: 'user_registered_total',
    help: 'Total number of user registrations',
    registers: [register]
})

export const loginTotal = new Counter({
    name: 'login_total',
    help: 'Total number of login attempts',
    labelNames: ['success'] as const,
    registers: [register]
})

export const fightPlayedTotal = new Counter({
    name: 'fight_played_total',
    help: 'Total number of fights completed',
    labelNames: ['type'] as const,
    registers: [register]
})

export const matchmakingFailedTotal = new Counter({
    name: 'matchmaking_failed_total',
    help: 'Total number of ranked matchmaking failures',
    labelNames: ['reason'] as const,
    registers: [register]
})

export const runStartedTotal = new Counter({
    name: 'run_started_total',
    help: 'Total number of runs started',
    registers: [register]
})
