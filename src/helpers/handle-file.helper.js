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

const getFiles = function(path) {
    try {
        let stats = fs.statSync(path);

        if (stats.isFile()) {
            return [path];
        }

        if (stats.isDirectory()) {
            let filenames = fs.readdirSync(path);
            let pathMap = filenames.map(e => `${path}/${e}`);
            return pathMap;
        }
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
    }
}

const getPath = function(path) {
    try {
        let dirnameMap = pathLib.resolve('./').split('/') || pathLib.resolve('./').split('\\');
        let pathMap = path.split('/') || path.split('\\');
        let intersection = pathMap.filter(x => dirnameMap.includes(x));
        if (intersection.length < 2) {
            return pathLib.resolve(`./${path}`)
        } else {
            return path;
        }
    } catch (error) {
        log(`Error: ${error}`, true);
        throw error;
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
        if (stringFile && datafiles.some(el => new RegExp(`${el.name}`, 'g').test(stringFile)) == true) {
            return true;
        } else {
            log(`Some data files needed by the tests with path ${path} are missing. If your tests don't use data files, don't use parameter "data". `, true);
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
    getPath,
    getFiles
}