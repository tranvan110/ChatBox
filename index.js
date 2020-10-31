'use strict';

const express = require('express');
const { Server } = require('ws');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const request = require('request');
const server = express();

require('dotenv').config();
// console.log(process.env);

const PORT = process.env.PORT || 5000;
const INDEX = '/index.html';

// A unique identifier for the given session
const sessionId = uuid.v4();
const projectId = "chatbox-cuvs";
const apiKey = process.env.WEATHERSTACK_APIKEY;
const weather = `http://api.weatherstack.com/current?access_key=${apiKey}`;

// Create a new session
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

server.use((req, res) => res.sendFile(INDEX, { root: __dirname }));
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
const wss = new Server({server});

wss.on('connection', (ws) => {
	console.log('Client connected');
	ws.on('close', () => {
		console.log('Client disconnected');
	});

	ws.on('message', function (data, flags) {
		if (flags.binary) { return; }
		console.log(data);
		Dialogflow(data, function (error, weather) {
			var str = "";
			if (error) {
				ws.send('Error');
			}
			else {
				str += `Descriptions: ${weather.weather_descriptions}\n`;
				str += `Visibility: ${weather.visibility}\n`;
				str += `Temperature: ${weather.temperature}\n`;
				str += `Feelslike: ${weather.feelslike}\n`;
				str += `Humidity: ${weather.humidity}\n`;
				str += `Pressure: ${weather.pressure}\n`;
				str += `Wind speed: ${weather.wind_speed}\n`;
				str += `UV index: ${weather.uv_index}\n`;
				console.log(str);
				ws.send(str);
			}
		});

		ws.on('close', function () {
			console.log('Connection closed!');
		});
		ws.on('error', function (e) {
		});
	});
});

setInterval(() => {
	wss.clients.forEach((client) => {
		client.send(new Date().toTimeString());
	});
}, 1000);

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
	const city = result.parameters.fields.City.stringValue;
	console.log(`Action: ${result.action}`);
	console.log(result.parameters);


	console.log('Detected intent');
	console.log(`  Query: ${result.queryText}`);
	console.log(`  Response: ${result.fulfillmentText}`);
	if (result.intent) {
		console.log(`  Intent: ${result.intent.displayName}`);
	} else {
		console.log(`  No intent matched.`);
	}

	if (result.action == 'input.thoitiet') {
		var url = encodeURI(`${weather}&query=${city},Vietnam`);
		console.log(url);
		request(url, function (error, response, body) {
			if (error)
				return callback(error);
			else
				return callback(null, JSON.parse(body).current);
		});
	}

	return
}