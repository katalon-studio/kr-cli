const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');
const stringify = require('csv-stringify');
const pathLib = require('path');
const winston = require('winston');

const { log } = require('./handle-file.helper');
const logger = require('./logger.helper');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const socketExecution = async(driver, path, datafiles, reportDir) => {
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
    let UUI = new Date().getTime();

    io.on('connection', (socket) => {
        socket.emit('sendHtml', {
            data: fileContents,
            datafiles: datafiles
        });
        //logger show in terminal
        socket.on("logger", (data) => {
            if (data.type === "error") {
                logger(`${reportDir}/${UUI}`).error(data.mess);

            } else {
                logger(`${reportDir}/${UUI}`).info(data.mess)
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
                stringify(reportResult, {
                    header: true
                }, async function(err, output) {
                    if (output) {
                        if (reportDir) {
                            fs.writeFileSync(`${reportDir}/${UUI}/kr_execution.csv`, output.toString());
                        }
                        await driver.quit();
                        process.exit();
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