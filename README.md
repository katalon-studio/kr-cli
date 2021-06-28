# Katalon Recorder Command-line Runner

This is the official command-line runner for [Katalon Recorder](https://www.katalon.com/katalon-recorder-ide/). Katalon Recorder is the most UI-friendly and simplest extension for Record and Playback on Chrome, Firefox, and Edge. 

## About Katalon Recorder
Katalon Recorder is famous for replacing manual works on the browsers with automation: 
- Automate the repetitive tasks on browsers, such as generating reports, filling forms, automating games, etc.
- Test your new features before handing your work over to the QA team
- Run synthetic testing to monitor the functionality of web applications
- Shareable reports with visual dashboards and charts

Katalon Recorder is also the perfect alternative web recorder to Selenium IDE by:
- Supporting the legacy Selenium IDE's commands and extension scripts (AKA user-extensions.js) for developing custom locator builders and actions. 
- Ability to add your own method of locating elements into KR through extension script.
- Data-driven testing capabilities
- Exporting Selenium WebDriver scripts in various formats and frameworks (Python, C#, Java, JavaScript, Ruby, Groovy, XML, Protractor, and so on)
- Integrating with other Katalon solutions (Katalon Studio and Katalon TestOps) for advanced test generation, reporting, and test orchestration needs.


## Prerequisites
- node.
- npm.
- [katalon-recorder-cli](https://www.npmjs.com/package/katalon-recorder-cli).
    

If you are using Homebrew to manage dependencies, do the following:

```
brew install node
npm install kr-cli
```

## Using KR CLI as a tester

If you are a tester, you can integrate KR tests into the CI/CD pipeline to execute them regularly or on specific conditions without manual interventions.

### Executing a test suite

`kr-cli run <browser> <pathToHtmlFile> --report <pathToReportFolder>`

1.  Replace pathToHtmlFile with the absolute path to your KR test suite.    
2.  Replace browser with either chrome or firefox.    
3.  Replace pathToReportFolder with the absolute path an existing folder.    
4.  Execute the command.
    

A report file with .csv extension and a log file with .log extension will be generated at the specified report folder.

### Executing a test suite with data files

`kr-cli run <browser> <pathToHtmlFile> --report <pathToReportFolder> --data <pathToData1>`

1.  Replace pathToHtmlFile with the absolute path to your KR test suite.    
2.  Replace browser with either chrome or firefox.    
3.  Replace pathToReportFolder with the aboluste path to an existing folder.    
4.  Replace pathToData1 with the absolute path to your data file.    
5.  Execute the command.
    
If your test suite use multiple data files, separate the paths with a comma. A report file with .csv extension and a log file with .log extension will be generated at the specified report folder.

## Using KR CLI as a developer

If you are a developer, you can integrate KR tests into your development process to ensure that your code doesn't break important user experiences.

### Executing all test suites in a project

`kr-cli dev <browser> --lg`

1.  Place all KR test suites under folder /tests/kr-test in your NodeJS project.    
2.  Replace browser with chrome or firefox.     
3.  Execute the command.
    
When you run in development mode, by default no report or log files are going to be generated. An overview of the execution will be printed directly to your command-line tool. When `--lg` is specified, the logs will also be printed to your command-line tool as the tests are being executed.

## License

Refer to NOTICE and KATALON RECORDER CONTRIBUTION LICENSE AGREEMENT for Katalon Recorder.

Refer to APACHE LICENSE 2.0 for SideeX.

Please inform us if you found any unlicensed part of source code.

## Companion products

### Katalon TestOps

[Katalon TestOps](https://analytics.katalon.com) is a web-based application that provides dynamic perspectives and an insightful look at your automation testing data. You can leverage your automation testing data by transforming and visualizing your data; analyzing test results; seamlessly integrating with such tools as Katalon Studio and Jira; maximizing the testing capacity with remote execution.

* Read our [documentation](https://docs.katalon.com/katalon-analytics/docs/overview.html).
* Ask a question on [Forum](https://forum.katalon.com/categories/katalon-analytics).
* Request a new feature on [GitHub](CONTRIBUTING.md).
* Vote for [Popular Feature Requests](https://github.com/katalon-analytics/katalon-analytics/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc).
* File a bug in [GitHub Issues](https://github.com/katalon-analytics/katalon-analytics/issues).

### Katalon Studio
[Katalon Studio](https://www.katalon.com) is a free and complete automation testing solution for Web, Mobile, and API testing with modern methodologies (Data-Driven Testing, TDD/BDD, Page Object Model, etc.) as well as advanced integration (JIRA, qTest, Slack, CI, Katalon TestOps, etc.). Learn more about [Katalon Studio features](https://www.katalon.com/features/).
