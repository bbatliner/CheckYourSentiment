'use strict'

// https://davidwalsh.name/javascript-polling
function poll (fn, interval = 100, timeout = 2000) {
  const endTime = Date.now() + timeout
  return new Promise(function checkCondition (resolve, reject) {
    const result = fn()
    if (result) {
      return resolve(result)
    }
    if (Date.now() < endTime) {
      return setTimeout(checkCondition, interval, resolve, reject);
    }
    return reject(new Error('Timed out.'))
  })
}

// http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element
function stringToDom (html) {
   var wrapMap = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        area: [ 1, "<map>", "</map>" ],
        param: [ 1, "<object>", "</object>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        body: [0, "", ""],
        _default: [ 1, "<div>", "</div>"  ]
    };
    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    html = html.trim();
    var match = /<\s*\w.*?>/g.exec(html);
    var element = document.createElement('div');
    if(match != null) {
        var tag = match[0].replace(/</g, '').replace(/>/g, '').split(' ')[0];
        if(tag.toLowerCase() === 'body') {
            var dom = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
            var body = document.createElement("body");
            // keeping the attributes
            element.innerHTML = html.replace(/<body/g, '<div').replace(/<\/body>/g, '</div>');
            var attrs = element.firstChild.attributes;
            body.innerHTML = html;
            for(var i=0; i<attrs.length; i++) {
                body.setAttribute(attrs[i].name, attrs[i].value);
            }
            return body;
        } else {
            var map = wrapMap[tag] || wrapMap._default, element;
            html = map[1] + html + map[2];
            element.innerHTML = html;
            // Descend through wrappers to the right content
            var j = map[0]+1;
            while(j--) {
                element = element.lastChild;
            }
        }
    } else {
        element.innerHTML = html;
        element = element.lastChild;
    }
    return element;
}

// https://gomakethings.com/climbing-up-and-down-the-dom-tree-with-vanilla-javascript/
function getClosest (selector, elem) {
    // Get closest match
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) {
            return elem
        }
    }
    return null
}

function getNearest (selector, elem) {
    return elem.querySelector(selector) || getClosest(selector, elem)
}

function getFarthest (selector, elem) {
    let farthest
    for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) {
            farthest = elem
        }
    }
    return farthest
}

function getFurthest (selector, elem) {
    return elem.querySelector(selector) || getFarthest(selector, elem)
}

const onUrlChange = (function () {
  const myScript = document.createElement('script')
  myScript.innerHTML = `
    // http://felix-kling.de/blog/2011/01/06/how-to-detect-history-pushstate/
    const pushState = history.pushState;
    history.pushState = function customPushState (state) {
      if (typeof history.onpushstate === 'function') {
        history.onpushstate({ state });
      }
      window.postMessage({ type: 'pushState' }, '*')
      return pushState.apply(history, arguments);
    }

    // Also handle forward/back buttons
    window.addEventListener('popstate', () => window.postMessage({ type: 'popstate' }, '*'))
  `
  document.head.appendChild(myScript)

  const handlers = []
  window.addEventListener('message', (event) => {
    if (event.source !== window) {
      return
    }
    if (event.data.type === 'pushState' || event.data.type === 'popstate') {
      handlers.forEach(handler => handler())
    }
  })

  return function onUrlChange (fn) {
    handlers.push(fn)
  }
}())
