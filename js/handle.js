let HOST = location.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST);

function BtnHandle() {
    var msg = document.getElementById("inputMsg").value;
    var p = document.createElement("p");
    p.setAttribute("class", "msg align-right");
    p.innerText = msg;
    var div = document.createElement("div");
    div.appendChild(p);
    div.setAttribute("class", "right");
    document.getElementById("chat").appendChild(div);

    ws.send(msg);
}

ws.onmessage = (event) => {
    var p = document.createElement("p");
    p.setAttribute("class", "msg");
    p.innerText = event.data;
    var div = document.createElement("div");
    div.appendChild(p);
    document.getElementById("chat").appendChild(div);
};