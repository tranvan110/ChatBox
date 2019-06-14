const PORT = process.env.PORT || 5000;
const express = require('express');
const path = require('path');
const webApp = express();

const ip = require('ip');
const server = require('http').createServer(webApp);
const io = require('socket.io')(server);

webApp.use(express.static(path.join(__dirname, 'public')));
webApp.set('views', path.join(__dirname, 'views'));
webApp.set('view engine', 'ejs');
webApp.get('/', (req, res) => res.render('index', { value: null }));

server.listen(PORT, function () {
    console.log("Server address: " + ip.address() + ":" + PORT);
});

const events = ["AppSent", "heartRate", "temperature", "bt-bom", "bt-update", "tem", "hum", "light", "led", "pump", "win", "btLivingroom", "btBathroom", "btAlarm", "sosCall", "sosSms"];

io.on("connection", function (socket) {
    console.log("Connected");
    socket.emit("ServerSent", "Send from Server");

    events.forEach(function (event) {
        socket.on(event, function (message) {
            console.log(event + ": " + message);
            socket.broadcast.emit(event, message);
        });
    });

    socket.on("disconnect", function () {
        console.log("Disconnect");
    });
});