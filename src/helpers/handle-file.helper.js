const fs = require('fs');
const { parse } = require('himalaya');
const pathLib = require('path');

const log = function(content, isError) {
    if (!isError) {
        return console.log(`>> [INFO] Message: ${content}`);
    } else {
        return console.log(`>> [ERROR] Error message: ${content}`);
    }
}

const checkPathFrom = function(path) {
    console.log(path.includes(pathLib.resolve('./')));
    if (!path.includes(pathLib.resolve('./'))) {
        return pathLib.resolve(`./${path}`)
    } else {
        return path;
    }
}

const checkExistsFile = function(path) {
    try {
        if (fs.existsSync(path)) {
            return true;
        } else {
            log(`The path doesn't exists. ${path}`, true);
            return false;
        }
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const checkFormatedFile = function(path) {
    try {
        let formatting = path.split('.').pop().toLowerCase();
        if (formatting === "html") {
            return true;
        } else {
            log(`The execution target must be a HTML file or a folder that contains at least one HTML file.`, true);
            return false;
        }
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const checkKRformatedFile = function(path) {
    try {
        const KRHtml = convertHTMLtoJSON(path);
        if (KRHtml) {
            const body = KRHtml.find(el => el.children && el.children.length > 0);
            if (body) {
                const childrenBody = body.children.find(el => el.tagName === "body");
                if (childrenBody.children.some(el => el.tagName && el.tagName !== "table") == true) {
                    log(`The execution target is not a valid KR test suite or a folder that contains at least one valid KR test suite. No tests were executed.`, true);
                    return false;
                } else {
                    return true;
                }
            } else {
                log(`The execution target is not a valid KR test suite or a folder that contains at least one valid KR test suite. No tests were executed.`, true);
                return false;
            }
        } else {
            log(`The execution target is not a valid KR test suite or a folder that contains at least one valid KR test suite. No tests were executed.`, true);
            return false;
        }
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const convertHTMLtoJSON = (path) => {
    try {
        const dataFile = fs.readFileSync(path, { encoding: 'utf8' });
        if (dataFile) {
            const KRHtml = parse(dataFile);
            return KRHtml;
        } else {
            return undefined;
        }
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const checkDataFilesinHTML = (path, datafiles) => {
    try {
        const stringFile = fs.readFileSync(path, { encoding: 'utf8' }).toString();
        if (stringFile && datafiles.every(el => new RegExp(`${el.name}`, 'g').test(stringFile)) == true) {
            return true;
        } else {
            log(`Some data files needed by the tests are missing. If your tests don't use data files, don't use parameter "data". `, true);
            return false;
        }
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

module.exports = {
    checkExistsFile,
    checkFormatedFile,
    checkKRformatedFile,
    checkDataFilesinHTML,
    convertHTMLtoJSON,
    log,
    checkPathFrom
}