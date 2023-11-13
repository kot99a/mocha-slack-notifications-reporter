const mocha = require('mocha');
const slack = require('./lib/slack');
module.exports = MyReporter;

function MyReporter (runner, options) {
  mocha.reporters.Base.call(this, runner);
  let passes = 0;
  let failures = 0;
  const failedTests = [];

  runner.on('pass', function (test) {
    passes++;
    console.log('pass: %s', test.fullTitle());
  });

  runner.on('fail', function (test, err) {
    failures++;
    console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
    failedTests.push({
      test,
      err
    });
  });

  runner.on('end', () => {
    console.log('end: %d/%d', passes, passes + failures);
    sendReport();
  });

  const sendReport = function () {
    const report = {};
    const reporterOptions = options?.reporterOptions;

    if (reporterOptions?.title) {
      report.title = reporterOptions.title;
    }
    if (reporterOptions?.linkToReport) {
      report.linkToReport = reporterOptions.linkToReport;
    }
    if (reporterOptions?.environment) {
      report.environment = reporterOptions.environment;
    }
    if (reporterOptions?.additionalInfo) {
      report.additionalInfo = reporterOptions.additionalInfo;
    }
    if (typeof (reporterOptions?.useEmoji) === 'boolean') {
      if (reporterOptions.useEmoji) {
        report.useEmoji = reporterOptions.useEmoji;
      }
    }
    if (typeof (reporterOptions?.useReportButton) === 'boolean') {
      if (reporterOptions.useReportButton) {
        report.useReportButton = reporterOptions.useReportButton;
      }
    }

    if (typeof (reporterOptions?.logFailedTests) === 'boolean') {
      if (reporterOptions.logFailedTests) {
        report.failedTests = failedTests;
      }
    }
    if (typeof (reporterOptions?.logFailedTestsInDetail) === 'boolean') {
      if (reporterOptions.logFailedTestsInDetail) {
        report.logFailedTestsInDetail = reporterOptions.logFailedTestsInDetail;
      }
    }

    report.total = passes + failures;
    report.failures = failures;
    report.passed = passes;

    // Slack notifications
    if (reporterOptions?.url && reporterOptions?.username && reporterOptions?.channel) {
      slack.sendWebhook(report, reporterOptions);
      return true;
    } else {
      throw new Error('You didn\'t specify the required variables for sending the message in slack! \n Required variables: url, channel, username');
    }
  };
}
