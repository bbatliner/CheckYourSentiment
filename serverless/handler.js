'use strict'

const watson = require('watson-developer-cloud')
const toneAnalyzer = watson.tone_analyzer({
  username: process.env.TONE_ANALYZER_USERNAME,
  password: process.env.TONE_ANALYZER_PASSWORD,
  version: 'v3',
  version_date: '2016-05-19'
})

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    })
  }

  callback(null, response)

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
}

module.exports.analyze = (event, context, callback) => {
  const response = {}
  const body = JSON.parse(event.body)

  if (typeof body.text !== 'string') {
    callback(null, { statusCode: 400, body: JSON.stringify({ message: 'The "text" parameter is required.' }) })
    return
  }

  toneAnalyzer.tone({ text: body.text }, (err, tone) => {
    if (err) {
      callback(null, { statusCode: 500, body: JSON.stringify({ message: err.message }) })
      return
    }
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(tone)
    })
  })
}
