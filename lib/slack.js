const request = require('sync-request');

exports.sendWebhook = async function (testReport, options) {
  try {
    const blocks = [];
    const slackReport = {};

    if (testReport.title && testReport.linkToReport) {
      slackReport.text = `*${testReport.title}* \n Last build's report link: ${testReport.linkToReport}`;
    } else if (testReport.title) {
        slackReport.text = `*${testReport.title}*`;
      } else if (testReport.linkToReport) {
          slackReport.text = `*Test completion notification message* \n Last build's report link: ${testReport.linkToReport}`;
        } else {
            slackReport.text = `*Test completion notification message*`;
          };
    const testResultFields = [];
    testResultFields.push({
      type: 'mrkdwn',
      text: '*Total:* ' + testReport.total
    });

    testResultFields.push({
      type: 'mrkdwn',
      text: '*Passed:* ' + testReport.passed
    });

    testResultFields.push({
      type: 'mrkdwn',
      text: '*Failed:* ' + testReport.failures
    });
    if (testReport.failedTests && testReport.failedTests.length) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Failed tests are:*'
        }
      });
      testReport.failedTests.forEach(ele => {
        const text = `*${ele.test.parent.title}     ${ele.test.title}* \n> ${ele.err.stack.replace(/\n/g, '\n>')} \n>`;
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: text
          }
        });
      });
    }

    slackReport.attachments = [{
      blocks: [{
        type: 'section',
        fields: testResultFields
      }],
      color: '#36a64f'
    }, {
      blocks: blocks,
      color: '#d50200'
    }];
    slackReport.channel = options.channel;
    const result = request('POST', options.url, {
      json: {
        ...slackReport
      }
    });
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
