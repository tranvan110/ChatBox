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
const socket = require('ws').Server;
const server = require('http').createServer(webApp);
const wss = new socket({ server: server, path: '/dialog' });
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
		console.log(data);
		if (flags) {
			return;
		}
		if (data == "pi_online") {
			piws = ws;
		}
		else if (ws == piws) {
			wss.clients.forEach(function each(client) {
				if (client !== ws && client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		}
		else {
			Dialogflow(data, function (error, msg) {
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

async function Dialogflow(msg, callback) {
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
		if (parameters.City.stringValue == 'Nha' && piws.readyState === WebSocket.OPEN) {
			console.log("Command: tem?");
			piws.send("tem?");
		}
		else {
			var city = result.parameters.fields.City.stringValue;
			var url = encodeURI(`${weather}&query=${city},Vietnam`);
			request(url, function (error, response, body) {
				if (error) {
					return callback(error);
				}
				var weather = JSON.parse(body).current;
				var msg = `Trạng thái: ${weather.weather_descriptions}, tầm nhìn: ${weather.visibility} Km\n`;
				msg += `Nhiệt độ: ${weather.temperature} độ, cảm giác như: ${weather.feelslike} độ\n`;
				msg += `Độ ẩm: ${weather.humidity}%, áp suất không khí: ${weather.pressure}\n`;
				msg += `Tốc độ gió: ${weather.wind_speed}, chỉ số UV: ${weather.uv_index}\n`;
				return callback(null, msg);
			});
		}
	}
	else {
		var msg = parameters.action.stringValue + parameters.device.stringValue;
		console.log(`Command: ${msg}`);
		if (piws.readyState === WebSocket.OPEN) {
			piws.send(msg);
		}
		return callback(null, result.fulfillmentText);
	}

	return
}