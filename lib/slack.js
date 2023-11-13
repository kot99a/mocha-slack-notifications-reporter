const request = require('sync-request');
const _  = require('lodash');
const { colors } = require('../helpers/colors');
const { emoji } = require('../helpers/emoji');

exports.sendWebhook = function (testReport, options) {
  try {
    // Global variables
    const slackReport = { attachments: [] };

    // Adding a message title
    slackReport.text = testReport?.title ? `*${testReport.title}*` : `*Test completion notification message*`;

    // // Add test run report link/button to the message
    if (testReport?.linkToReport) {
      if (testReport?.useReportButton) {
        const buttonBlock = addReportButtonBlock(testReport.linkToReport)
        slackReport.attachments.push(buttonBlock);
      } else {
        slackReport.text += `\n Last build's report link: ${testReport.linkToReport}`;
      }
    }

    // Add test environment to the message
    if (testReport?.environment) slackReport.text += `\n Environment: *${testReport.environment}*`;

    // Add additional information to the message
    if (_.isPlainObject(testReport?.additionalInfo)) {
      const additionalInfo = testReport.additionalInfo;
      for (const index in additionalInfo) {
        slackReport.text += `\n ${index}: ${additionalInfo[index]}`;
      }
    }

    // Add general test results to the message
    const generalResultBlock = addGeneralResultsBlock(testReport)
    slackReport.attachments.push(generalResultBlock);

    if (testReport?.failedTests && testReport?.failedTests?.length > 0) {
      const failedTestsBlock = addFailedResultsBlock(testReport);
      slackReport.attachments.push(failedTestsBlock);
    }

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
}

// Generate a block with a report link button  
function addReportButtonBlock (link) {
  return {
    blocks: [
      {
        type: 'actions',
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📝 Report",
              emoji: true
            },
            url: link,
            style: "primary"
          }
        ]
      }
    ],
    color: colors.none
  }
}

// Generate a block with a general report results info
function addGeneralResultsBlock (testReport) {
  let useEmoji = testReport?.useEmoji;
  if (typeof useEmoji !== 'boolean') useEmoji = false;

  const testResultFields = [];
  testResultFields.push({
    type: 'mrkdwn',
    text: `${useEmoji ? `${emoji.detective} ` : ''}*Total:* ${testReport.total}`
  });

  testResultFields.push({
    type: 'mrkdwn',
    text: `${useEmoji ? `${emoji.excited} ` : ''}*Passed:* ${testReport.passed}`
  });

  testResultFields.push({
    type: 'mrkdwn',
    text: `${useEmoji ? `${emoji.warning} ` : ''}*Failed:* ${testReport.failures}`
  });

  return {
    blocks: [{
      type: 'section',
      fields: testResultFields
    }],
    color: useEmoji ? colors.none : colors.green
  };
}

// Generate a block with a failed test info and their errors
function addFailedResultsBlock (testReport) {
  let logDatails = testReport?.logFailedTestsInDetail;
  if (typeof logDatails !== 'boolean') logDatails = false;

  const blocks = [];

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Failed tests are:*'
    }
  });
  testReport.failedTests.forEach(ele => {
    const text = `*${ele.test.title}* ${logDatails ? `\n> ${ele.err.stack.replace(/\n/g, '\n>')} \n>` : ''}`;
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: text
      }
    });
  });

  return {
    blocks: blocks,
    color: colors.red
  };
}