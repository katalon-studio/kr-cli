const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
// const edge = require('selenium-webdriver/edge');

const openBrowser = async (browser) => {
    require('chromedriver');
    require('geckodriver');
    // require('edgedriver');
    const driver = await new webdriver.Builder()
        .forBrowser(browser);
    switch (browser) {
        case 'chrome':
            {
                const options = new chrome.Options();
                options.addArguments("disable-infobars");
                options.addArguments("start-maximized");
                options.addArguments("--enable-automation");
                const dirname = appRoot.split('src')[0] + "katalon-recorder/kr-chrome.crx";
                options.addExtensions(dirname);

                driver.withCapabilities(webdriver.Capabilities.chrome())
                    .setChromeOptions(options);

                break;
            }
        // case 'edge':
        //     {
        //         const options = new edge.Options();
        //         options.addArguments("disable-infobars");
        //         options.addArguments("start-maximized");
        //         options.addArguments("--enable-automation");
        //         // const dirname = appRoot.split('src')[0] + "katalon-recorder/kr-chrome.crx";
        //         // options.addExtensions(dirname);

        //         driver.withCapabilities(webdriver.Capabilities.edge())
        //             .setEdgeOptions(options);

        //         break;
        //     }
        case 'firefox':
            {
                const dirname = appRoot.split('src')[0] + "katalon-recorder/kr-firefox.xpi";
                console.log(dirname)
                const options = new firefox.Options();
                options.addExtensions(dirname);
                options.setPreference("marionette.enabled", true);

                driver.setFirefoxOptions(options);
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