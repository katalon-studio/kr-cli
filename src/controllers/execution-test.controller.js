const { executionTestService, executionTestDevService } = require("../services/execution-test.service");

const executionTestController = async function(browser, path, options) {
    try {
        return executionTestService(browser, path, options);
    } catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
}

const executionTestDevController = async function(browser, options) {
    try {
        return executionTestDevService(browser, options);
    } catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
}

module.exports = {
    executionTestController,
    executionTestDevController
}