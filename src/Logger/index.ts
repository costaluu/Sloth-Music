const consola = require('consola')

const Logger = (level: number, file: string) => {
    return consola.create({
        level: level,
        reporters: [
            new consola.FancyReporter({
                dateFormat: 'HH:mm:ss YYYY/DD/MM',
                formatOptions: {
                    date: true,
                    colors: true,
                    compact: false,
                },
            }),
        ],
        defaults: {
            tag: file,
        },
    })
}

export default Logger
