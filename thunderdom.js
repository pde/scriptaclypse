function setup() {
    player1 = new Worker("player1.js")
    player2 = new Worker("player2.js")
    player1.onmessage = function(event) {
        x = JSON.parse(event)
        if (x.read) {
            val = document.getElementById(x.read.id);
            player1.postMessage(val);
        }
        if (x.write) {
            document.setElementById(x.write.id, x.write.val);
        }
    }
}
function player1comm() {
}
