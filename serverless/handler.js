'use strict'

const watson = require('watson-developer-cloud')
const toneAnalyzer = watson.tone_analyzer({
  username: process.env.TONE_ANALYZER_USERNAME,
  password: process.env.TONE_ANALYZER_PASSWORD,
  version: 'v3',
  version_date: '2016-05-19'
})

function getResponse (statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS 
    },
    body: JSON.stringify(body)
  }
}

module.exports.analyze = (event, context, callback) => {
  const response = {}

  let body
  try {
    body = JSON.parse(event.body)
  } catch (err) {
    callback(null, getResponse(500, { message: 'Request body could not be parsed.' }))
    return
  }

  if (typeof body.text !== 'string') {
    callback(null, getResponse(400, { message: 'The "text" parameter is required.' }))
    return
  }

  toneAnalyzer.tone({ text: body.text }, (err, tone) => {
    if (err) {
      callback(null, getResponse(500, { message: err.message }))
      return
    }
    callback(null, getResponse(200, tone))
  })
}
