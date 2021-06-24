const winston = require('winston');
const path = require('path');

function filename(dirname) {
    if (dirname) {
        return { filename: path.join(dirname, `kr_execution.log`) };
    } else {
        return { filename: path.join(path.resolve(`./tests/logs`), `kr_execution.log`) }
    }
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
        transports: [
            new winston.transports.Console(),
            new winston.transports.File(filename(dirname))
        ],
    })
}