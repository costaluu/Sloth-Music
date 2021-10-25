import pino from 'pino'

const Logger = (level: string, file: string) => {
    return pino({
        level,
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname,fileName',
                translateTime: 'yyyy-mm-dd HH:MM:ss',
                levelFirst: false,
            },
        },
        serializers: {
            err: (e) => {
                stack: e.stack
            },
            error: (e) => {
                stack: e.stack
            },
        },
    }).child({ name: file })
}

export default Logger
