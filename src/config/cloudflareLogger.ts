/** Pino-compatible logger for Workers when pretty-print is undesirable. */
export function createCloudflareLogger(): {
  debug: (objOrMsg: object | string, msg?: string) => void
  error: (objOrMsg: object | string, msg?: string) => void
  fatal: (objOrMsg: object | string, msg?: string) => void
  info: (objOrMsg: object | string, msg?: string) => void
  level: string
  silent: () => void
  trace: (objOrMsg: object | string, msg?: string) => void
  warn: (objOrMsg: object | string, msg?: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} & Record<string, any> {
  const createLog =
    (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
      if (typeof objOrMsg === 'string') {
        fn(JSON.stringify({ level, msg: objOrMsg }))
      } else {
        fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
      }
    }

  return {
    debug: createLog('debug', console.debug),
    error: createLog('error', console.error),
    fatal: createLog('fatal', console.error),
    info: createLog('info', console.log),
    level: process.env.PAYLOAD_LOG_LEVEL || 'info',
    silent: () => {},
    trace: createLog('trace', console.debug),
    warn: createLog('warn', console.warn),
  } as any
}
