const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');
const stringify = require('csv-stringify');
const { Table } = require('console-table-printer');

const { log } = require('./handle-file.helper');
const logger = require('./logger.helper');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const socketExecution = async(driver, files, datafiles, reportDir, verbose) => {
    const fileContents = await files.map(el => {
        let rs = {
            content: fs.readFileSync(el.path, { encoding: 'utf8' }).toString(),
            hasData: el.hasData
        }

        return rs;
    });

    if (datafiles) {
        datafiles = datafiles.reduce(function(result, item) {
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
            if (fileContents[ind].hasData) {
                socket.emit('sendHtml', {
                    data: fileContents[ind].content,
                    datafiles: datafiles
                });
            } else {
                socket.emit('sendHtml', {
                    data: fileContents[ind].content,
                    datafiles: undefined
                });
            }
            doneTestCase = false;
        }
    }

    function printTableResult(arr, prop) {
        const p = new Table();
        arr.forEach(el => {
            if (el[prop] === 'passed') {
                el[prop] = el[prop].toUpperCase();
                p.addRow({...el }, { color: 'green' });
            } else {
                el[prop] = el[prop].toUpperCase();
                p.addRow({...el }, { color: 'red' });
            }
        });
        log('Report:', false)
        p.printTable();
    }

    io.on('connection', (socket) => {
        //send HTML
        sendHTML(socket, true, 0)

        //logger show in cli
        if (verbose) {
            socket.on("logger", (data) => {
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
            });
        }

        //info testsuite and testcases
        socket.on("infoTestSuite", (data) => {
            reportMap.push({
                ...data,
                numOfTestcases: data.testCases.length,
                executedAt: new Date()
            });
        });

        //result of execution
        socket.on("result", async(data) => {
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
        });

        socket.on("doneSuite", async(data) => {
            index++;
            if (index <= fileContents.length - 1) {
                console.log(index)
                sendHTML(socket, true, index);
            }

            setTimeout(async() => {
                let numbOfAllTests = reportMap.reduce((rs, el) => {
                    rs = rs + el.numOfTestcases;
                    return rs;
                }, 0);

                if (reportResult.length === numbOfAllTests) {
                    if (verbose) {
                        stringify(reportResult, {
                            header: true
                        }, async function(err, output) {
                            if (output) {
                                if (reportDir) {
                                    fs.writeFileSync(`${reportPath}/kr_execution.csv`, output.toString());
                                } else {
                                    printTableResult(reportResult, 'Status');
                                }
                                await driver.quit();
                                process.exit();
                            }
                        });
                    } else {
                        printTableResult(reportResult, 'Status');
                        await driver.quit();
                        process.exit();
                    }
                }
            }, 500);


        })

        //disconnect
        socket.on("manual-disconnection", async function(data) {
            await driver.quit();
            process.exit();
        });
    });

    server.listen(3500, () => {
        log('listening on *:3500');
    });
}

module.exports = {
    socketExecution
}