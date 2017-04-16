'use strict'

const USE_API = true
function getToneData (text) {
  if (USE_API) {
    return fetch('https://lubnpw4d3b.execute-api.us-east-1.amazonaws.com/dev/analyze', {
      method: 'post',
      body: JSON.stringify({ text })
    }).then(response => {
      return response.json()
    }).then(data => {
      return data
    }).catch(err => {
      console.error(err)
    })
  }
  return Promise.resolve({"document_tone":{"tone_categories":[{"tones":[{"score":0.783081,"tone_id":"anger","tone_name":"Anger"},{"score":0.198486,"tone_id":"disgust","tone_name":"Disgust"},{"score":0.055768,"tone_id":"fear","tone_name":"Fear"},{"score":0.003896,"tone_id":"joy","tone_name":"Joy"},{"score":0.116359,"tone_id":"sadness","tone_name":"Sadness"}],"category_id":"emotion_tone","category_name":"Emotion Tone"},{"tones":[{"score":0,"tone_id":"analytical","tone_name":"Analytical"},{"score":0,"tone_id":"confident","tone_name":"Confident"},{"score":0,"tone_id":"tentative","tone_name":"Tentative"}],"category_id":"language_tone","category_name":"Language Tone"},{"tones":[{"score":0.260708,"tone_id":"openness_big5","tone_name":"Openness"},{"score":0.274468,"tone_id":"conscientiousness_big5","tone_name":"Conscientiousness"},{"score":0.541878,"tone_id":"extraversion_big5","tone_name":"Extraversion"},{"score":0.598669,"tone_id":"agreeableness_big5","tone_name":"Agreeableness"},{"score":0.249501,"tone_id":"emotional_range_big5","tone_name":"Emotional Range"}],"category_id":"social_tone","category_name":"Social Tone"}]}})
}

function fbUserContentProcessor (el) {
  let isColorful = false
  function setBackgroundColor (r, g, b, a) {
    if (a === 0) {
      return
    }
    if (isColorful) {
      el.querySelector('.userContent').firstChild.style.backgroundColor = `rgba(${r},${g},${b},${a})`
    } else {
      const userContent = Array.from(el.querySelectorAll('.userContent')).filter(el => el.textContent.length > 0)[0]
      userContent.style.backgroundColor = `rgba(${r},${g},${b},${a})`
      userContent.style.padding = '5px'
      userContent.style.borderRadius = '3px'
      userContent.style.marginLeft = '-5px'
      userContent.style.marginRight = '-5px'
    }
    const upper = getClosest('.fbUserContent', el)
    const lower = el.querySelector('.fbUserContent')
    ;(upper || lower).style.border = `1px solid rgba(${r},${g},${b},${2*a})`
  }
  let userContent = Array.from(el.querySelectorAll('.userContent p')).map(p => p.textContent).join('')
  if (!userContent.length) {
    const potentialText = Array.from(new Set(Array.from(el.querySelectorAll('.userContent span')).map(el => el.textContent)))[0]
    if (potentialText) {
      isColorful = true
      userContent = potentialText
    } else {
      return
    }
  }
  getToneData(userContent)
    .then(data => {
      console.log(userContent)
      const emotionTones = data.document_tone.tone_categories[0].tones
      emotionTones.sort((a, b) => {
        return b.score - a.score
      })
      const THRESHOLD = 0.5
      if (emotionTones[0].score < THRESHOLD) {
        return
      }
      emotionTones[0].score = (1 / THRESHOLD) * (emotionTones[0].score - THRESHOLD)
      switch (emotionTones[0].tone_name) {
        case 'Anger':
          setBackgroundColor(217, 8, 0, emotionTones[0].score)
          break
        case 'Disgust':
          setBackgroundColor(214, 89, 232, emotionTones[0].score)
          break
        case 'Fear':
          setBackgroundColor(48, 220, 61, emotionTones[0].score)
          break
        case 'Sadness':
          setBackgroundColor(0, 67, 255, emotionTones[0].score)
          break
        case 'Joy':
          setBackgroundColor(255, 249, 0, emotionTones[0].score)
          break
        default:
          console.error('Did not set colors:', emotionTones[0].tone_name)
          break
      }
    })
}

function onload () {
  Array.from(document.querySelectorAll('.fbUserContent')).forEach(el => {
    fbUserContentProcessor(el)
  })
}
if (document.readyState === 'complete') {
  onload()
} else {
  window.addEventListener('load', onload)
}

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.classList && node.classList.contains('fbUserContent') || node.querySelector && node.querySelector('.fbUserContent')) {
        fbUserContentProcessor(node)
      }
    })
  })
})
observer.observe(document.querySelector('[id^="feed_stream"]'), {
  childList: true,
  subtree: true
})
