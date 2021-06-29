const { executionJob, executionDevJob } = require('../jobs/execution-test.job');
const { log } = require('../helpers/handle-file.helper');

const executionTestService = async function(browser, path, options) {
    try {
        if (browser && path) {
            if (new RegExp('chrome|firefox', 'g').test(browser)) {
                executionJob(browser, path, options);
            } else {
                log("Browser hasn't been supported yet! Thanks!", true);
            }
        } else {
            log("Browser or path is not valid. Please try again!", true);
        }

    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const executionTestDevService = async function(browser, options) {
    try {
        if (browser) {
            executionDevJob(browser, options);
        } else {
            log("Browser or path is not valid. Please try again!", true);
        }

    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

module.exports = {
    executionTestService,
    executionTestDevService
}