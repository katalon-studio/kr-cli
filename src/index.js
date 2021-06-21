#!/usr/bin/env node

const program = require("commander");
const { executionTestController, executionTestDevController } = require("./controllers/execution-test.controller");
const path = require('path');
global.appRoot = path.resolve(__dirname);

program.version('1.0.0').description('Hello I am Katalon Recorder CLI')

program
    .command('run <browser> [path]')
    .option('-d , --data [dataFiles]', 'data files')
    .option('-rp , --report [reportDir]', 'report files')
    .alias('-r')
    .description('Run test suite')
    .action((browser, path, options) => executionTestController(browser, path, options))

program
    .command('dev <browser>')
    // .option('-p , --path [path]', 'specified path')
    // .option('-d , --data [dataFiles]', 'data files')
    .option('-v , --verbose', 'verbose')
    .alias('-dev')
    .description('Run test suite in development')
    .action((browser, options) => executionTestDevController(browser, options))
program.parse(process.argv)