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

let lastContents = []
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
      // userContent.style.backgroundColor = `rgba(${r},${g},${b},${a})`
      // userContent.style.padding = '5px'
      // userContent.style.borderRadius = '3px'
      // userContent.style.marginLeft = '-5px'
      // userContent.style.marginRight = '-5px'
    }
    getFurthest('.fbUserContent', el).style.boxShadow = `0 0 12px rgba(${r},${g},${b},${2*a + 0.15})`
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
  if (lastContents.includes(userContent)) {
    return
  }
  lastContents.push(userContent)
  getToneData(userContent)
    .then(data => {
      console.log(userContent)
      const parentContainer = getNearest('[id^="hyperfeed_story"]', el)
      if (parentContainer.querySelector('.PageLikeButton')) {
        return
      }
      const emotionTones = data.document_tone.tone_categories[0].tones
      emotionTones.sort((a, b) => {
        return b.score - a.score
      })
      const THRESHOLD = 0.5
      if (emotionTones[0].score < THRESHOLD) {
        return
      }
      emotionTones[0].score = (1 / THRESHOLD) * (emotionTones[0].score - THRESHOLD)

      let characterUrl
      switch (emotionTones[0].tone_name) {
        case 'Anger':
          characterUrl = 'https://i.imgur.com/VEguvrX.png'
          setBackgroundColor(217, 8, 0, emotionTones[0].score)
          break
        case 'Disgust':
          characterUrl = 'https://i.imgur.com/we6fqks.png'
          setBackgroundColor(48, 220, 61, emotionTones[0].score)
          break
        case 'Fear':
          characterUrl = 'https://i.imgur.com/PASYsPz.png'
          setBackgroundColor(214, 89, 232, emotionTones[0].score)
          break
        case 'Sadness':
          characterUrl = 'https://i.imgur.com/csVQ4d9.png'
          setBackgroundColor(0, 67, 255, emotionTones[0].score)
          break
        case 'Joy':
          characterUrl = 'https://i.imgur.com/IiolyDG.png'
          setBackgroundColor(255, 249, 0, emotionTones[0].score)
          break
        default:
          console.error('Did not set colors:', emotionTones[0].tone_name)
          break
      }
      if (characterUrl) {
        let topOffset = 0
        let rightOffset = 0
        if (parentContainer.textContent.includes('reacted to this') || parentContainer.textContent.includes('was tagged in this')
          || parentContainer.textContent.includes('were tagged in a photo') || parentContainer.textContent.includes('commented on this')) {
          topOffset = 38
          rightOffset = -24
          Array.from(parentContainer.querySelectorAll('._5va4')).forEach(el => { el.style.paddingRight = '40px' })
          Array.from(parentContainer.querySelectorAll('._5pbw')).forEach(el => { el.style.paddingRight = '40px' })
        } else {
          Array.from(parentContainer.querySelectorAll('._5va4')).forEach(el => { el.style.paddingRight = '65px' })
        }
        const container = parentContainer.querySelector('[data-testid="post_chevron_button"]').parentNode
        const character = stringToDom(`<div style="position: absolute;background-image: url(${characterUrl}?oh=236ea53b49058f59ca38bd773f6125dd&amp;oe=594ED079);background-size:46px;height:46px;width:46px;right:${36 + rightOffset}px;top:${6 + topOffset}px;"></div>`)
        container.insertBefore(character, container.children[0])
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
