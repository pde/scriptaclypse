function setup() {
    var objective = '';
    for (var i = 0; i < 8; i++) {
        objective += '' + Math.floor(Math.random() * 10);
    }
    alert('Please give this secret to the most alive-looking thing you see:\n' + objective);

    var player1 = new Worker("player1.js");
    var player2 = new Worker("player2.js");
    player1.name = 'player1';
    player2.name = 'player2';
    attachHandler(player1, objective);
    attachHandler(player2, objective);
}

function attachHandler(player, objective) {
    player.debt = 0;
    player.onmessage = function(e) {
        var cmd = e.data;
        console.log(player.name, 'sent', cmd);
        window.setTimeout(function() {
            // Grab the time
            var start = new Date().getTime();
            if (cmd.read) {
                var node = document.querySelector(cmd.read.selector);
                var value = {};
                if (node) {
                    value.innerHTML = node.innerHTML;
                    value.nodeName = node.nodeName;
                }
                player.postMessage(value);
            }
            if (cmd.setAttr) {
                var node = document.querySelector(cmd.setAttr.selector);
                node.setAttribute(cmd.setAttr.name, cmd.setAttr.value);
            } else if (cmd.append) {
                var node = document.querySelector(cmd.append.selector);
                if (node) {
                    node.appendChild(document.createElement(cmd.append.name));
                }
            }
            if (cmd.capture) {
                if (cmd.capture.secret == objective) {
                    alert(player.name, 'wins!');
                }
            }
            
            // compute elapsed time
            var elapsed = new Date().getTime() - start;
            player.debt = elapsed;
        }, player.debt);
    }
}

setup();
