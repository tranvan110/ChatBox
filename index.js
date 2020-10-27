'use strict';

const express = require('express');
const { Server } = require('ws');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const request = require('request');
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

const server = express()
	.use((req, res) => res.sendFile(INDEX, { root: __dirname }))
	.listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
	console.log('Client connected');
	ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
	wss.clients.forEach((client) => {
		client.send(new Date().toTimeString());
	});
}, 1000);

runSample();

async function runSample() {

	// The text query request.
	const params = {
		session: sessionPath,
		queryInput: {
			text: {
				text: 'Thời tiết Huế hôm nay thế nào?',
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
			let weather = JSON.parse(body);
			console.log('location:', weather);
			console.log('location:', weather.location);
			console.log('current:', weather.current);
			console.log('weather_descriptions:', weather.current.weather_descriptions);
			console.log('temperature:', weather.current.temperature);
			console.log('feelslike:', weather.current.feelslike);
			console.log('humidity:', weather.current.humidity);
			console.log('pressure:', weather.current.pressure);
			console.log('wind_speed:', weather.current.wind_speed);
			console.log('uv_index:', weather.current.uv_index);
			console.log('visibility:', weather.current.visibility);
		});
	}
}