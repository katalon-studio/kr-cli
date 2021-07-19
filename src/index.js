#!/usr/bin/env node

const program = require("commander");
const { executionTestController, executionTestDevController } = require("./controllers/execution-test.controller");
const path = require('path');
global.appRoot = path.resolve(__dirname);

const { version } = require('../package.json');
console.log(version)

program.version(version, '-v, --vers', 'output the current version').description('Hello I am Katalon Recorder CLI')

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
    .option('-lg , --logger', 'logger')
    .alias('-dev')
    .description('Run test suite in development')
    .action((browser, options) => executionTestDevController(browser, options))
program.parse(process.argv)