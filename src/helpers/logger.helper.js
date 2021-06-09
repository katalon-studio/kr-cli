const winston = require('winston');
const path = require('path');
const appRoot = path.resolve(__dirname);

module.exports = winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize(),
        winston.format.printf(
            log => {
                if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
                return `[${log.timestamp}] [${log.level}] ${log.message}`;
            },
        ),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(`${appRoot.split('src')[0]}log/`, `${new Date().getTime()}.log`)
        })
    ],
})