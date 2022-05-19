const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const puppeteer = require('puppeteer');

const extensionPath = "/Users/tra.nguyen/Katalon-project/katalon-recorder-private/src";

const openBrowser = async (browser) => {
    switch (browser) {
        case 'chrome':
            {
                return await puppeteer.launch({
                    headless: false,
                    // Chrome options
                    executablePath: process.env.PUPPETEER_EXEC_PATH,
                    args: [
                        `--no-sandbox`,
                        '--disable-setuid-sandbox',
                        `--load-extension=${extensionPath}`,
                        `--disable-extensions-except=${extensionPath}`,
                        `--window-size=870,740`
                    ],
                });
            }
        case 'edge':
            {
                return await puppeteer.launch({
                    headless: false,
                    // Chrome options
                    executablePath: process.env.PUPPETEER_EXEC_PATH,
                    args: [
                        `--no-sandbox`,
                        '--disable-setuid-sandbox',
                        `--load-extension=${extensionPath}`,
                        `--disable-extensions-except=${extensionPath}`,
                        `--window-size=${browserSize.width},${browserSize.height}`
                    ],
                });
            }
        case 'firefox':
            {
                require('geckodriver');
                const driver = await new webdriver.Builder()
                    .forBrowser(browser);
                const dirname = appRoot.split('src')[0] + "katalon-recorder/kr-firefox.xpi";
                const options = new firefox.Options();
                options.addExtensions(dirname);
                options.setPreference("marionette.enabled", true);

                return driver.setFirefoxOptions(options).build().then(d => {
                    return d;
                });
            }
        default:
            break;
    }
    
};

module.exports = {
    openBrowser
}