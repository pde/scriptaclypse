onmessage = function(e) {
    console.log('player2 received', e.data);
}

function setAttrs(selector, attrs) {
    for (var name in attrs) {
        postMessage({
            'setAttr': {
                'selector': selector,
                'name': name,
                'value': attrs[name]
            }
        });
    }
}

var makeDiv = {
    'append': {
        'selector': 'body',
        'name': 'div'
    }
};

postMessage(makeDiv);
setAttrs('div', {'style': 'width: 100%; height: 100%',
                 'onmouseover': 'eval("alert(777)")'});
