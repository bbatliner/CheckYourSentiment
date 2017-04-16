'use strict'

// This WeakMap maps DOM Nodes to `true`. It exists to tell us if we've seen this DOM node before,
// without holding strong references and preventing DOM nodes that have been removed from the DOM
// from being garbage collected.
const inputs = new WeakMap()
const composer = document.querySelector('#pagelet_composer')
composer.addEventListener('click', () => {
  poll(() => composer.querySelector('[contenteditable=true]'))
    .then(input => {
      // Only do our processing if we haven't seen this contenteditable element before
      if (inputs.get(input)) {
        return
      }
      inputs.set(input, true)

      input.addEventListener('input', () => {
        console.log(input.textContent)
      })

      // Create an Analyze Post button
      const analyzeButton = stringToDom('<button class="_1mf7 _4jy0 _4jy3 _4jy1 _51sy selected _42ft"><span class=""><em class="_4qba">Analyze Post</em></span></button>')
      analyzeButton.addEventListener('click', () => {
        // Analyze the sentiment of the post content, if it exists
        const text = input.textContent
        if (text.length === 0) {
          return
        }
        fetch('https://lubnpw4d3b.execute-api.us-east-1.amazonaws.com/dev/analyze', {
          method: 'post',
          body: JSON.stringify({ text })
        }).then(response => {
          return response.json()
        }).then(data => {
          console.log(data)
        }).catch(err => {
          console.error(err)
        })
      })

      // Add the Analyze Post button to the post box
      const buttonContainer = document.querySelector('button[data-testid="react-composer-post-button"]').parentNode
      buttonContainer.children[0].style.paddingLeft = '10px'
      buttonContainer.insertBefore(analyzeButton, buttonContainer.children[0])
    })
})
