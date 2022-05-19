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

const socketExecution = async (driver, files, datafiles, reportDir, verbose) => {
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

    function sendHTML(socket, doneTestCase, ind) {
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
            socket.sendUTF(JSON.stringify(sentData));
            doneTestCase = false;
        }
    }

    function printTableResult(arr, prop) {
        const p = new Table();
        arr.forEach(el => {
            if (el[prop] === 'passed') {
                el[prop] = el[prop].toUpperCase();
                p.addRow({ ...el }, { color: 'green' });
            } else {
                el[prop] = el[prop].toUpperCase();
                p.addRow({ ...el }, { color: 'red' });
            }
        });
        log('Report:', false)
        p.printTable();
    }

    function loggerState(data) {
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
                        logger(reportPath).info(data.mess)
                        break;
                    }
            }
        }
    }

    function logTestSuite(data) {
        if (data.testSuite && reportMap.length <= fileContents.length) {
            reportMap.push({
                id: index,
                ...data,
                numOfTestcases: data.testCases.length,
                executedAt: new Date()
            });
            console.log(reportMap)
        }
    }

    function checkDoneTestSuite(data) {
        index++;
        console.log(fileContents.length)
        if (index <= fileContents.length - 1) {
            sendHTML(socket, true, index);
        }

        setTimeout(async () => {
            let numbOfAllTests = reportMap.reduce((rs, el) => {
                rs = rs + el.numOfTestcases;
                return rs;
            }, 0);

            if (reportResult.length === numbOfAllTests) {
                if (verbose) {
                    const output = stringify(reportResult);
                    if (output) {
                        if (reportDir) {
                            fs.writeFileSync(`${reportPath}/kr_execution.csv`, output.toString());
                        } else {
                            printTableResult(reportResult, 'Status');
                        }
                        if (driver.browser == "firefox") {
                            await driver.quit();
                        } else {
                            driver.close();
                        }

                        process.exit();
                    }
                } else {
                    printTableResult(reportResult, 'Status');
                    if (driver.browser == "firefox") {
                        await driver.quit();
                    } else {
                        driver.close();
                    }
                    process.exit();
                }
            }
        }, 500);
    }

    async function showResultOfTestSuite(data) {
        if (reportMap[index]) {
            await reportMap[index].testCases.forEach(e => {
                if (e === data.testcase) {
                    reportResult.push({
                        'Test Suite': reportMap[index].testSuite,
                        'Test Case': e,
                        'Status': data.result
                    });
                }
            })
        }
    }

    wsServer.on('request', function (request) {
        const socket = request.accept(null, request.origin);

        sendHTML(socket, true, 0);

        socket.on('message', function (message) {
            if (message.type === 'utf8') {
                let data = JSON.parse(message.utf8Data);

                if (verbose) {
                    loggerState(data);
                }

                //start to log info of test suite
                logTestSuite(data);

                //check to next test case 
                checkDoneTestSuite(data);

                //show result of test suite
                showResultOfTestSuite(data);
            }
        });

        socket.on('close', function (connection) {
            // close user connection
        });
    });
}

module.exports = {
    socketExecution
}