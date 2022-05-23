const express = require('express');
const http = require('http');
const WebSocketServer = require('websocket').server;
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');
const { Table } = require('console-table-printer');

const { log } = require('./handle-file.helper');
const logger = require('./logger.helper');

const app = express();
const server = http.createServer(app);

server.listen(3567, () => {
    log('listening on *:3567');
});

wsServer = new WebSocketServer({
    httpServer: server
});

const socketExecution = async (browserInfo, files, datafiles, reportDir, verbose) => {
    let socketConnection = null;

    const fileContents = await files.map(el => {
        let rs = {
            content: fs.readFileSync(el.path, { encoding: 'utf8' }).toString(),
            hasData: el.hasData
        }

        return rs;
    });

    if (datafiles) {
        datafiles = datafiles.reduce(function (result, item) {
            result[item.name] = {
                content: fs.readFileSync(item.dirname, { encoding: 'utf8' }).toString(),
                type: item.name.split('.').pop()
            };
            return result;
        }, {})
    }
    let reportMap = [];
    let reportResult = [];
    let reportPath = reportDir ? `${reportDir}/${new Date().getTime()}` : undefined;
    let index = 0;

    function sendHTML(doneTestCase, ind) {
        //send TestSuite 
        if (ind == 0) {
            doneTestCase = true;
        }
        if (doneTestCase) {
            let sentData = {
                data: fileContents[ind].content,
                datafiles: undefined
            }
            if (fileContents[ind].hasData) {
                sentData.datafiles = datafiles;
            }
            socketConnection.sendUTF(JSON.stringify(sentData));
            doneTestCase = false;
        }
    }

    function printTableResult(arr, prop) {
        const p = new Table({
            columns: [
                { name: 'testsuite', title: 'Test Suite' }, // with alignment and color
                { name: 'testcase', title: 'Test Case' },
                { name: 'status', title: 'Status' }, // with Title as separate Text
            ]
        });
        arr.forEach(el => {
            if (el[prop] === 'passed') {
                p.addRow({ ...el }, { color: 'green' });
            } else {
                p.addRow({ ...el }, { color: 'red' });
            }
        });
        log('Report:', false)
        p.printTable();
    }

    function loggerState(data, socket) {
        if (data.type) {
            switch (data.type) {
                case 'error':
                    {
                        logger(reportPath).error(data.mess);
                        break;
                    }
                case 'debug':
                    {
                        logger(reportPath).debug(data.mess);
                        break;
                    }
                case 'verbose':
                    {
                        logger(reportPath).verbose(data.mess);
                        break;
                    }
                default:
                    {
                        logger(reportPath).info(data.mess);
                        if (data.mess.includes("Finnish executing")) {
                            //check done current test suite to continue next test suite
                            checkDoneTestSuite(socket);
                        }
                        break;
                    }
            }
        }
    }

    function logTestSuite(data) {
        if (data.testSuite && reportMap.length < fileContents.length) {
            reportMap.push({
                id: index,
                ...data,
                numOfTestcases: data.testCases.length,
                executedAt: new Date()
            });
        }
    }

    function checkDoneTestSuite() {
        index++;
        if (index <= fileContents.length - 1) {
            sendHTML(true, index);
        }

        setTimeout(async () => {
            let numbOfAllTests = reportMap.reduce((rs, el) => {
                rs = rs + el.numOfTestcases;
                return rs;
            }, 0);

            if (reportResult.length === numbOfAllTests) {
                if (verbose) {
                    reportResult.unshift({
                        testsuite: 'Test Suite',
                        testcase: 'Test Case',
                        status: 'Status'
                    })
                    const output = stringify(reportResult);
                    if (output) {
                        if (reportDir) {
                            fs.writeFileSync(`${reportPath}/kr_execution.csv`, output.toString());
                        } else {
                            reportResult.shift();
                            printTableResult(reportResult, "status");
                        }

                        if (browserInfo.browser == "firefox") {
                            await browserInfo.driver.quit();
                        } else {
                            await browserInfo.driver.close();
                        }

                        process.exit();
                    }
                } else {
                    printTableResult(reportResult, 'status');
                    if (browserInfo.browser == "firefox") {
                        await browserInfo.driver.quit();
                    } else {
                        await browserInfo.driver.close();
                    }
                    process.exit();
                }
            }
        }, 500);
    }

    async function showResultOfTestSuite(data) {
        if (data.result && reportMap[index]) {
            await reportMap[index].testCases.forEach(e => {
                if (e === data.testcase) {
                    reportResult.push({
                        testsuite: reportMap[index].testSuite,
                        testcase: e,
                        status: data.result
                    });
                }
            })
        }
    }

    wsServer.on('request', function (request) {
        const socket = request.accept(null, request.origin);
        socketConnection = socket;

        sendHTML(true, 0);

        socket.on('message', function (message) {
            if (message.type === 'utf8') {
                let data = JSON.parse(message.utf8Data);

                if (verbose) {
                    loggerState(data);
                }

                //start to log info of test suite
                logTestSuite(data);

                //show result of test suite
                showResultOfTestSuite(data);
            }
        });
    });
}

module.exports = {
    socketExecution
}