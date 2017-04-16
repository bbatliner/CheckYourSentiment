'use strict'

const watson = require('watson-developer-cloud')
const toneAnalyzer = watson.tone_analyzer({
  username: process.env.TONE_ANALYZER_USERNAME,
  password: process.env.TONE_ANALYZER_PASSWORD,
  version: 'v3',
  version_date: '2016-05-19'
})

module.exports.analyze = function analyze (text) {
  return new Promise((resolve, reject) => {
    toneAnalyzer.tone({ text }, (err, tone) => {
      if (err) {
        reject(err)
        return
      }
      resolve(tone)
    })
  })
}
