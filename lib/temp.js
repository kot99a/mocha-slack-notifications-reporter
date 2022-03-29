const request = require('request-promise-native');
request({
  uri: 'https://hooks.slack.com/services/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',
  method: 'POST',
  json: true,
  body: {
    channel: '#random',
	        text: 'HelloWorld'
  }
}).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err);
});
