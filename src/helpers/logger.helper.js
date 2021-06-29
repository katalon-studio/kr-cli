const winston = require('winston');
const path = require('path');
let timestamp = new Date().getTime();

function filename(dirname) {
    if (dirname) {
        return path.join(dirname, `kr_execution.log`)
    } else {
        return path.join(path.resolve(`./tests/logs`), `${timestamp}.log`)
    }
}

const options = {
    console: {
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.colorize({
                all: true
            }),
            winston.format.printf(
                log => {
                    if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
                    return `[${log.timestamp}] [${log.level}] ${log.message}`;
                },
            ),
        ),
    },
}

module.exports = (dirname) => {
    return winston.createLogger({
        levels: {
            debug: 0,
            verbose: 1,
            error: 2,
            info: 3,
            http: 4,
            warn: 5,
            silly: 6
        },
        transports: [
            new winston.transports.Console(options.console),
            new winston.transports.File({
                filename: filename(dirname),
                format: winston.format.combine(
                    winston.format.splat(),
                    winston.format.timestamp({
                        format: 'YYYY-MM-DD HH:mm:ss'
                    }),
                    winston.format.printf(
                        log => {
                            if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
                            return `[${log.timestamp}] [${log.level}] ${log.message}`;
                        },
                    ),
                )
            })
        ],
    })
}