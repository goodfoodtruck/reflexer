import winston from 'winston'

const isProduction = process.env.NODE_ENV === 'production'

const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) =>
        `[${timestamp}] ${level}: ${message}`
    )
)

const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
)

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? prodFormat : devFormat,
    defaultMeta: { service: 'reflexer-server' },
    transports: [
        new winston.transports.Console(),
        ...(isProduction ? [] : [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' })
        ])
    ]
})

export default logger