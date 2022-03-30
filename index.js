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

  runner.on('end', async () => {
    console.log('end: %d/%d', passes, passes + failures);
    await sendReport();
  });

  const sendReport = async function () {
    const report = { };
    const reporterOptions = options.reporterOptions;
    if (reporterOptions.title) {
      report.title = reporterOptions.title;
    }
    if (reporterOptions.linkToReport) {
      report.linkToReport = reporterOptions.linkToReport;
    }
    report.total = passes + failures;
    report.failures = failures;
    report.passed = passes;
    if (typeof (reporterOptions.logFailedTests) === 'boolean') {
      if (reporterOptions.logFailedTests) {
        report.failedTests = failedTests;
      }
    }
    // Slack notifications
    if (reporterOptions.url && reporterOptions.username && reporterOptions.channel) {
      await slack.sendWebhook(report, reporterOptions);
      return true;
    } else {
      throw new Error('You didn\'t specify the required variables for sending the message in slack! \n Required variables: url, channel, username');
    }
  };
}
