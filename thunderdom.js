function setup() {
    var objective = '';
    for (var i = 0; i < 6; i++) {
        objective += '' + Math.floor(Math.random() * 10);
    }
    alert('Please give this secret to the most alive-looking thing you see:\n' + objective);

    var doc = document;
    var docqs = document.querySelector;
    var docce = document.createElement;
    var qs = function(x) { return docqs.call(doc, x); };
    var ce = function(x) { return docce.call(doc, x); };

    if (Math.random() < 0.5) {
        var player1 = new Worker("player4.js");
        var player2 = new Worker("player3.js");
        player1.name = 'player4';
        player2.name = 'player3';
        attachHandler(player1, objective, qs, ce);
        attachHandler(player2, objective, qs, ce);
    } else {
        var player2 = new Worker("player3.js");
        var player1 = new Worker("player4.js");
        player1.name = 'player4';
        player2.name = 'player3';
        attachHandler(player2, objective, qs, ce);
        attachHandler(player1, objective, qs, ce);
    }
}


function attachHandler(player, objective, querySelector, createElement) {
    player.debt = 0;
    player.won = false;
    player.onmessage = function(e) {
        var cmd = e.data;
        window.setTimeout(function() {
            // Grab the time
            var start = new Date().getTime();
            if (cmd.read) {
                var node = querySelector(cmd.read.selector);
                var value = {};
                if (node) {
                    value.innerHTML = node.innerHTML;
                    value.nodeName = node.nodeName;
                }
                player.postMessage(value);
            }
            if (cmd.setAttr) {
                var node = querySelector(cmd.setAttr.selector);
                if (node) {
                    node.setAttribute(cmd.setAttr.name, cmd.setAttr.value);
                }
            } else if (cmd.append) {
                var node = querySelector(cmd.append.selector);
                if (node) {
                    node.appendChild(createElement(cmd.append.name));
                }
            }
            if (cmd.capture && !player.won) {
                if (cmd.capture.secret == objective) {
                    alert(player.name + ' wins!');
                    player.won = true;
                } else {
                    console.log(player.name + ' failed to capture: ' + cmd.capture.secret + ' != ' + objective);
                }
            }
            // compute elapsed time
            var elapsed = new Date().getTime() - start;
            player.debt = elapsed;
        }, player.debt);
    }
}

setup();
