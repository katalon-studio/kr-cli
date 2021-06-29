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
                        hasData: checkDataFilesinHTML(e)
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
                    if (options.report && typeof options.report === 'string' && checkExistsFile(getPath(options.report))) {
                        if (options.data && typeof options.data === 'string') {
                            let dataMap = [];
                            if (options.data.includes(',')) {
                                dataMap = options.data.split(',').map(el => {
                                    return {
                                        name: el.split('/').pop(),
                                        dirname: getPath(el)
                                    };
                                });
                            } else {
                                let dataFiles = getFiles(getPath(options.data));
                                if (dataFiles && dataFiles.length > 0) {
                                    dataMap = getDataFiles(dataFiles);
                                }
                            }

                            if (dataMap.length > 0 && dataMap.every(el => checkExistsFile(el.dirname)) == true) {
                                let finalFiles = await getCheckedFiles(filesMap, dataMap);

                                if (finalFiles && finalFiles.length > 0) {
                                    let driver = await openBrowser(browser);
                                    if (driver) {
                                        socketExecution(driver, finalFiles, dataMap, getPath(options.report), true)
                                    }
                                } else {
                                    log("The files is not valid. Please try again!", true);
                                }
                            } else {
                                log("The files is not valid. Please try again!", true);
                            }
                        } else {
                            let driver = await openBrowser(browser);
                            if (driver) {
                                socketExecution(driver, filesMap, undefined, getPath(options.report), true)
                            }
                        }
                    } else {
                        log("The path of report is not valid. Please try again!", true);
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