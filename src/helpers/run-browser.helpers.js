const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

function encode(file) {
    const dirname = appRoot.split('src')[0];
    const stream = require('fs').readFileSync(dirname + file);
    return Buffer.from(stream).toString('base64');
}

const openBrowser = async(browser) => {
    require('chromedriver');
    require('geckodriver');
    const driver = await new webdriver.Builder()
        .forBrowser(browser);
    switch (browser) {
        case 'chrome':
            {
                const options = new chrome.Options();
                options.addArguments("--enable-automation");
                options.addExtensions(encode("katalon-recorder/kr-chrome.crx"));

                driver.withCapabilities(webdriver.Capabilities.chrome())
                .setChromeOptions(options);

                break;
            }
        case 'firefox':
            {
                const dirname = appRoot.split('src')[0] + "katalon-recorder/kr-firefox.xpi";
                const options = new firefox.Options();
                options.setPreference("marionette.enabled", true);
                options.addExtensions(dirname);


                driver.withCapabilities(webdriver.Capabilities.firefox())
                .setFirefoxOptions(options);
                break;
            }
        default:
            break;
    }
    return driver.build().then(d => {
        return d;
    });
};

module.exports = {
    openBrowser
}