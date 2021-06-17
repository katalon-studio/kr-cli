const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const fs = require('fs');
const stringify = require('csv-stringify');

const { log } = require('./handle-file.helper');
const logger = require('./logger.helper');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const socketExecution = async(driver, files, datafiles, reportDir) => {
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
    let UUI = new Date().getTime();
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

    io.on('connection', (socket) => {

        //send HTML
        sendHTML(socket, true, 0)

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
            reportMap.push({
                ...data,
                numOfTestcases: data.testCases.length,
                executedAt: new Date()
            });
        });

        //result of execution
        socket.on("result", async(data) => {
            await reportMap.forEach(el => {
                el.testCases.forEach(e => {
                    if (e == data.testcase)
                        reportResult.push({
                            'Test Suite': el.testSuite,
                            'Test Case': e,
                            'Status': data.result
                        });
                })
            })
        });


        socket.on("doneSuite", async(data) =>{
            index++;
            if (index <= fileContents.length - 1) {
                sendHTML(socket, true, index);
            }

            setTimeout(() => {
                let numbOfAllTests = reportMap.reduce((rs, el) => {
                    rs = rs + el.numOfTestcases;
                    return rs;
                }, 0);

                if (reportResult.length === numbOfAllTests) {
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