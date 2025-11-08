import pino from 'pino'

/**
 * Centralized Logging System using Pino
 * Provides structured logging with different levels
 */

const isDevelopment = process.env.NODE_ENV === 'development'

// Create logger instance with appropriate configuration
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
  },
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    service: 'leetcode-oauth-app',
  },
})

/**
 * Helper functions for structured logging
 */

export const logRequest = (method: string, url: string, statusCode?: number) => {
  const logData = {
    type: 'http_request',
    method,
    url,
    ...(statusCode && { statusCode }),
  }

  if (statusCode && statusCode >= 400) {
    logger.error(logData, `${method} ${url} - ${statusCode}`)
  } else {
    logger.info(logData, `${method} ${url}${statusCode ? ` - ${statusCode}` : ''}`)
  }
}

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    type: 'error',
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  }, error.message)
}

export const logAuth = (action: string, userId?: string, metadata?: Record<string, any>) => {
  logger.info({
    type: 'auth',
    action,
    ...(userId && { userId }),
    ...metadata,
  }, `Auth: ${action}`)
}

export const logDatabase = (operation: string, model: string, metadata?: Record<string, any>) => {
  logger.debug({
    type: 'database',
    operation,
    model,
    ...metadata,
  }, `DB: ${operation} ${model}`)
}

export const logExternalAPI = (
  service: string,
  endpoint: string,
  statusCode?: number,
  duration?: number
) => {
  logger.info({
    type: 'external_api',
    service,
    endpoint,
    ...(statusCode && { statusCode }),
    ...(duration && { duration: `${duration}ms` }),
  }, `External API: ${service} - ${endpoint}`)
}

export const logMetric = (metric: string, value: number, unit?: string) => {
  logger.info({
    type: 'metric',
    metric,
    value,
    ...(unit && { unit }),
  }, `Metric: ${metric} = ${value}${unit ? ` ${unit}` : ''}`)
}

// Export logger as default for direct usage
export default logger
