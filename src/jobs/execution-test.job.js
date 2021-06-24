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

            if (!e.path) {
                if (checkFormatedFile(e) && checkKRformatedFile(e)) {
                    rs = {
                        path: e,
                        hasData: false
                    };
                }
            } else {
                rs = e;
            }

            if (datafiles && checkDataFilesinHTML(e.path, datafiles)) {
                rs.hasData = checkDataFilesinHTML(e.path, datafiles);
            }

            return rs;
        }).filter(el => el != undefined)
        return filesMap;
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

function getDataFiles(files) {
    try {
        let filesMap = files.map(e => {
            let formatting = e.split('.').pop().toLowerCase();
            if (formatting === "json" || formatting === "csv") {
                return {
                    name: e.split('/').pop(),
                    dirname: getPath(e)
                };
            }
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

                if (filesMap && filesMap.length > 0) {
                    if (options.report && checkExistsFile(getPath(options.report))) {
                        if (options.data) {
                            let dataMap = options.data.split(',').map(el => {
                                return {
                                    name: el.split('/').pop(),
                                    dirname: getPath(el)
                                };
                            });

                            if (dataMap.every(el => checkExistsFile(el.dirname)) == true) {
                                let finalFiles = await getCheckedFiles(filesMap, dataMap);

                                if (finalFiles && finalFiles.length > 0) {
                                    return openBrowser(browser)
                                        .then((driver) => socketExecution(driver, finalFiles, dataMap, getPath(options.report), true));
                                } else {
                                    log("The files is not valid. Please try again!", true);
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
                    log(`The execution target must be a HTML file or a folder that contains at least one HTML file.`, true);
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
        let dirname = getPath(pathLib.resolve('./tests/kr-test'));
        if (checkExistsFile(dirname)) {
            let files = getFiles(dirname);

            if (files) {
                let filesMap = await getCheckedFiles(files, undefined);

                if (filesMap && filesMap.length > 0) {
                    let dataMap = getDataFiles(files);

                    if (dataMap && dataMap.length > 0) {
                        let finalFiles = await getCheckedFiles(filesMap, dataMap);

                        if (finalFiles && finalFiles.length > 0) {
                            return openBrowser(browser)
                                .then((driver) => socketExecution(driver, finalFiles, dataMap, undefined, options.logger ? options.logger : false));
                        } else {
                            log("The files is not valid. Please try again!", true);
                        }
                    } else {
                        return openBrowser(browser)
                            .then((driver) => socketExecution(driver, filesMap, undefined, undefined, options.logger ? options.logger : false));
                    }
                } else {
                    log(`The execution target must be a HTML file or a folder that contains at least one HTML file.`, true);
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