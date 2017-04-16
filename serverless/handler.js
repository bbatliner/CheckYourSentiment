'use strict'

const twitter = require('./twitter')
const toneAnalyzer = require('./toneAnalyzer')

function getResponse (statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      'Cache-Control': 'max-age=3600'
    },
    body: JSON.stringify(body)
  }
}

module.exports.analyze = (event, context, callback) => {
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

  toneAnalyzer.analyze(body.text)
    .then(tone => {
      callback(null, getResponse(200, tone))
    })
    .catch(err => {
      callback(null, getResponse(500, { message: err.message }))
    })
}

module.exports.report = (event, context, callback) => {
  const username = event.queryStringParameters ? event.queryStringParameters.username : null
  if (typeof username !== 'string' || username.length === 0) {
    callback(null, getResponse(400, { message: 'The "username" parameter is required.' }))
    return
  }

  const tweetsPromise = twitter.getTweets(username)
  const tonesPromise = tweetsPromise.then(tweets => Promise.all(tweets.map(tweet => toneAnalyzer.analyze(tweet.text))))
  Promise.all([tweetsPromise, tonesPromise])
    .then(([tweets, tones]) => {
      callback(null, getResponse(200, { tweets, tones }))
    })
    .catch(err => {
      callback(null, getResponse(500, { message: err.message }))
    })
}