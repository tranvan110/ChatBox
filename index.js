'use strict';

const PORT = process.env.PORT || 5000;
require('dotenv').config();
// console.log(process.env);

const express = require('express');
const request = require('request');
const path = require('path');
const webApp = express();

const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const wsocket = require('ws');
const server = require('http').createServer(webApp);
const wss = new wsocket.Server({ server: server, path: '/dialog' });
server.listen(PORT, () => console.log(`Listening on ${PORT}`));

// A unique identifier for the given session
const sessionId = uuid.v4();
const projectId = "chatbox-cuvs";
const apiKey = process.env.WEATHERSTACK_APIKEY;
const weather = `http://api.weatherstack.com/current?access_key=${apiKey}`;

// Create a new session
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

webApp.use(express.static(path.join(__dirname, 'public')));
webApp.get('/', (req, res) => res.render('index', { value: null }));

var piws;

wss.on('connection', (ws) => {
	console.log(`Client connected`);
	ws.on('close', () => {
		console.log('Client disconnected');
	});

	ws.on('error', function () {
		console.log('Connection error');
	});

	ws.on('message', function (data, flags) {
		if (flags) {
			return;
		}
		if (data == "pi_online") {
			console.log(data);
			piws = ws;
		}
		else if (ws == piws) {
			console.log(data);
			wss.clients.forEach(function each(client) {
				if (client != ws && client.readyState == wsocket.OPEN) {
					client.send(data);
				}
			});
		}
		else {
			console.log(data);
			Dialogflow(data, piws, function (error, msg) {
				console.log(msg);
				if (error) {
					ws.send('Error');
				}
				else {
					ws.send(msg);
				}
			});
		}
	});
});

async function Dialogflow(msg, socket, callback) {
	const params = {
		session: sessionPath,
		queryInput: {
			text: {
				text: msg,
				languageCode: 'en-US',
			},
		},
	};

	// Send request and log result
	const responses = await sessionClient.detectIntent(params);
	const result = responses[0].queryResult;
	const parameters = result.parameters.fields;

	console.log('parameters: ');
	console.log(parameters);

	if (result.intent) {
		console.log(`\nIntent: ${result.intent.displayName}`);
		console.log(`Query: ${result.queryText}`);
		console.log(`Response: ${result.fulfillmentText}`);
	} else {
		console.log('No intent matched.');
	}

	if (result.action == 'input.thoitiet') {
		if (parameters.City.stringValue == 'Nha' && socket.readyState == wsocket.OPEN) {
			console.log("Command: tem?");
			socket.send("tem?");
		}
		else {
			var city = result.parameters.fields.City.stringValue;
			var url = encodeURI(`${weather}&query=${city},Vietnam`);
			request(url, function (error, response, body) {
				if (error) {
					callback(error);
				}
				var weather = JSON.parse(body).current;
				var msg = `Trạng thái: ${weather.weather_descriptions}, tầm nhìn: ${weather.visibility} Km\n`;
				msg += `Nhiệt độ: ${weather.temperature} độ, cảm giác như: ${weather.feelslike} độ\n`;
				msg += `Độ ẩm: ${weather.humidity}%, áp suất không khí: ${weather.pressure}\n`;
				msg += `Tốc độ gió: ${weather.wind_speed}, chỉ số UV: ${weather.uv_index}\n`;
				callback(null, msg);
			});
		}
	}
	else {
		var msg = parameters.action.stringValue + parameters.device.stringValue;
		if (socket.readyState == wsocket.OPEN) {
			console.log(`Command: ${msg}`);
			socket.send(msg);
		}
		callback(null, result.fulfillmentText);
	}
}