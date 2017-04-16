'use strict'

const Twitter = require('twitter')
const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

module.exports.getTweets = function getTweets (username, options = {}) {
  return new Promise((resolve, reject) => {
    client.get('statuses/user_timeline', Object.assign({ screen_name: username, include_rts: false, count: 200 }, options), (error, tweets) => {
      if (error) {
        reject(error)
        return
      }
      resolve(tweets)
    })
  })
}
