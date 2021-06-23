#!/usr/bin/env node

const program = require("commander");
const { executionTestController, executionTestDevController } = require("./controllers/execution-test.controller");
const path = require('path');
global.appRoot = path.resolve(__dirname);

program.version('1.0.0').description('Hello I am Katalon Recorder CLI')

program
    .option('-d , --data [dataFiles]', 'data files')
    .option('-rp , --report [reportDir]', 'report files')
    .command('run <browser> [path]')
    .alias('-r')
    .description('Run test suite')
    .action((browser, path, options) => executionTestController(browser, path, options))

program
    .option('-lg , --logger', 'logger')
    .command('dev <browser>')
    // .option('-p , --path [path]', 'specified path')
    // .option('-d , --data [dataFiles]', 'data files')
    .alias('-dev')
    .description('Run test suite in development')
    .action((browser, options) => executionTestDevController(browser, options))
program.parse(process.argv)