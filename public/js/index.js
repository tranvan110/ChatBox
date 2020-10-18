$(document).ready(function () {
    var temSet = 25, humSet = 80, waterSet = 1;
    var auto = 1, demo = 0, tem = 0, hum = 0, light = 0, pump = 0, win = 0, led = 0;
    var socket = io("https://web8266-server.herokuapp.com/");

    socket.on("ServerSent", function (message) {
        $("#status").text("ServerSent: " + message);
        socket.emit("AppSent", "Hello from Web");
    });

    socket.on("tem", function (message) {
        tem = parseInt(message);
        $("#status").text("tem: " + message);
        $("#tem").text("Nhiệt độ: " + message + "*C");
    });

    socket.on("hum", function (message) {
        hum = parseInt(message);
        $("#status").text("hum: " + message);
        $("#hum").text("Độ ẩm: " + message + "%");
    });

    socket.on("light", function (message) {
        light = parseInt(message);
        $("#status").text("light: " + message);
        $("#light").text("Độ sáng: " + message);
    });

    socket.on("pump", function (message) {
        pump = message;
        $("#status").text("pump: " + message);
        if (pump == 1) document.getElementsByName("pump")[0].checked = true;
        else document.getElementsByName("pump")[0].checked = false;
    });

    socket.on("win", function (message) {
        win = message;
        $("#status").text("win: " + message);
        if (win == 1) document.getElementsByName("win")[0].checked = true;
        else document.getElementsByName("win")[0].checked = false;
    });

    socket.on("led", function (message) {
        led = parseInt(message);
        $("#status").text("led: " + message);
        if (led == 1) document.getElementsByName("led")[0].checked = true;
        else document.getElementsByName("led")[0].checked = false;
    });

    $(".manual").click(function () {
        if (auto == 0) {
            if ($(this).is(":checked")) {
                $("#status").text($(this).attr("name") + ": 1");
                socket.emit($(this).attr("name"), "1");
            } else {
                $("#status").text($(this).attr("name") + ": 0");
                socket.emit($(this).attr("name"), "0");
            }
        }
    });

    $("#auto").click(function () {
        if ($(this).is(":checked")) {
            auto = 0;
        }
        else {
            auto = 1;
        }
        console.log("auto: " + auto);
    });

    $("#save").click(function () {
        console.log("Save");
        var date1 = new Date(document.getElementById("date1").value).getTime();
        var date2 = new Date(document.getElementById("date2").value).getTime();
        var date3 = new Date(document.getElementById("date3").value).getTime();
        var time = new Date().getTime();
        if (time < date1) {
            temSet = parseInt(document.getElementById("tem1").value);
            humSet = parseInt(document.getElementById("hum1").value);
            waterSet = parseInt(document.getElementById("water1").value);
        }
        else if (InRange(time, date1, date2)) {
            temSet = parseInt(document.getElementById("tem2").value);
            humSet = parseInt(document.getElementById("hum2").value);
            waterSet = parseInt(document.getElementById("water2").value);
        }

        else if (InRange(time, date2, date3)) {
            temSet = parseInt(document.getElementById("tem3").value);
            humSet = parseInt(document.getElementById("hum3").value);
            waterSet = parseInt(document.getElementById("water3").value);
        }
        else {
            temSet = 25;
            humSet = 80;
            waterSet = 1;
        }

        function InRange(value, minValue, maxValue) {
            return (value >= minValue && value < maxValue);
        }
    });

    $(".demo").click(function () {
        if ($(this).is(":checked")) {
            $("#status").text($(this).attr("name") + ": 1");
            demo = 1;
        } else {
            $("#status").text($(this).attr("name") + ": 0");
            demo = 0;
        }
    });

    setInterval(function () {
        if (auto == 0) return;
        var today = new Date();
        var hours = parseInt(today.getHours());
        var minutes = parseInt(today.getMinutes());
        var seconds = parseInt(today.getSeconds());

        if (demo) {
            var times = document.getElementById("dmDate").value.split(":");
            hours = parseInt(times[0]);
            minutes = parseInt(times[1]);
            seconds = 0;
        }

        document.getElementById("time").innerHTML =
            "Thời gian: " + hours + ":" + minutes + ":" + seconds;

        if ((hours == 6 || hours == 18) && minutes == 0 && seconds == 0) {
            socket.emit("pump", "1");
            console.log("pump: 1");
        }
        if ((hours == 6 || hours == 18) && minutes == waterSet && seconds == 0) {
            socket.emit("pump", "0");
            console.log("pump: 0");
        }

        if (win == 0 && (hum > humSet)) {
            socket.emit("win", "1");
            console.log("win: 1");
        }
        else if (win == 1 && hum < humSet) {
            socket.emit("win", "0");
            console.log("win: 0");
        }

        if (led == 0 && light < 200 && tem < temSet) {
            socket.emit("led", "1");
            console.log("led: 1");
        }
        else if (led == 1 && light > 500 || tem > temSet) {
            socket.emit("led", "0");
            console.log("led: 0");
        }

    }, 1000);
});