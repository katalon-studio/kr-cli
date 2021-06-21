const pathLib = require('path')
const {
    checkExistsFile,
    checkFormatedFile,
    checkKRformatedFile,
    checkDataFilesinHTML,
    log,
    getPath,
    getFiles
} = require("../helpers/handle-file.helper");

const { openBrowser } = require("../helpers/run-browser.helpers");
const { socketExecution } = require("../helpers/socket-execution.helper");

function getCheckedFiles(files, datafiles) {
    try {
        let filesMap = files.map(e => {
            let rs;

            if (checkFormatedFile(e) && checkKRformatedFile(e)) {
                rs = {
                    path: e,
                    hasData: false
                };
            }

            if (datafiles && checkDataFilesinHTML(e, datafiles)) {
                rs.hasData = checkDataFilesinHTML(e, datafiles);
            }

            return rs;
        }).filter(el => el != undefined)
        return filesMap;
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const executionJob = async function(browser, path, options) {
    try {
        let dirname = getPath(path);
        if (checkExistsFile(dirname)) {
            let files = getFiles(dirname);
            if (files) {
                let filesMap = await getCheckedFiles(files, undefined);
                if (filesMap) {
                    if (options.report && checkExistsFile(getPath(options.report))) {
                        if (options.data) {
                            let dataMap = options.data.split(',').map(el => {
                                return {
                                    name: el.split('/').pop(),
                                    dirname: getPath(el)
                                };
                            });
                            if (dataMap.every(el => checkExistsFile(el.dirname)) == true) {
                                let finalFiles = await getCheckedFiles(files, dataMap);
                                if (finalFiles) {
                                    return openBrowser(browser)
                                        .then((driver) => socketExecution(driver, finalFiles, dataMap, getPath(options.report), true));
                                }
                            }
                        } else {
                            return openBrowser(browser)
                                .then((driver) => socketExecution(driver, filesMap, undefined, getPath(options.report), true));
                        }
                    } else {
                        log("The path of ReportLog is not valid. Please try again!" + getPath(options.report), true);
                    }
                } else {
                    log("The path is not valid. Please try again!", true);
                }
            } else {
                log("The path is not valid. Please try again!", true);
            }
        } else {
            log("The path is not valid. Please try again!", true);
        }

    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const executionDevJob = async function(browser, options) {
    try {

        let dirname = getPath(pathLib.resolve('./tests/kr-sample-project'));
        if (checkExistsFile(dirname)) {
            let files = getFiles(dirname);
            if (files) {
                let filesMap = await getCheckedFiles(files, undefined);
                if (filesMap) {
                    return openBrowser(browser)
                        .then((driver) => socketExecution(driver, filesMap, undefined, undefined, options.verbose ? options.verbose : false));
                } else {
                    log("The path is not valid. Please try again!", true);
                }
            } else {
                log("The path is not valid. Please try again!", true);
            }
        } else {
            log("The path is not valid. Please try again!", true);
        }

    } catch (error) {
        log(`Error: ${ error }`, true);
        throw error;
    }
}

module.exports = {
    executionJob,
    executionDevJob
}