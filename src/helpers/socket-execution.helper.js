const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');
const stringify = require('csv-stringify');
const path = require('path');
const { log } = require('./handle-file.helper');
const logger = require('./logger.helper');
const pathLib = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const appRoot = path.resolve(__dirname);

const socketExecution = async(path, datafiles, reportDir) => {
    const fileContents = await fs.readFileSync(path, { encoding: 'utf8' }).toString();
    if (datafiles) {
        datafiles = datafiles.reduce(function(result, item) {
            result[item.name] = {
                content: fs.readFileSync(item.dirname, { encoding: 'utf8' }).toString(),
                type: item.name.split('.').pop()
            };
            return result;
        }, {})
    }

    let reportMap = {};
    let reportResult = [];

    io.on('connection', (socket) => {
        socket.emit('sendHtml', {
            data: fileContents,
            datafiles: datafiles
        });
        //logger show in terminal
        socket.on("logger", (data) => {
            if (data.type === "error") {
                logger.error(data.mess)
            } else {
                logger.info(data.mess)
            }
        });
        //info testsuite and testcases
        socket.on("infoTestSuite", (data) => {
            reportMap = {
                ...data,
                numOfTestcases: data.testCases.length,
                executedAt: new Date()
            };
        });
        //result of execution
        socket.on("result", async(data) => {
            await reportMap.testCases.forEach(e => {
                if (e == data.testcase)
                    reportResult.push({
                        'Test Suite': reportMap.testSuite,
                        'Test Case': e,
                        'Status': data.result
                    });
            })

            if (reportResult.length === reportMap.numOfTestcases) {
                await stringify(reportResult, {
                    header: true
                }, function(err, output) {
                    if (output) {
                        if (reportDir) {
                            fs.writeFileSync(pathLib.resolve(`./${reportDir}/${new Date().getTime()}_kr_execution.csv`), output.toString());
                        } else {
                            if (!fs.existsSync(`${appRoot.split('src')[0]}report`)) {
                                fs.mkdirSync(`${appRoot.split('src')[0]}report`);
                            }
                            fs.writeFileSync(`${appRoot.split('src')[0]}report/${new Date().getTime()}_kr_execution.csv`, output.toString());
                        }
                    }
                });
            }
        });
    });

    server.listen(3500, () => {
        log('listening on *:3500');
    });
}

module.exports = {
    socketExecution
}