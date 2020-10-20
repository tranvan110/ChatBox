'use strict';

const express = require('express');
const { Server } = require('ws');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
require('dotenv').config();
// console.log(process.env);

const PORT = process.env.PORT || 5000;
const INDEX = '/index.html';

// A unique identifier for the given session
const sessionId = uuid.v4();
const projectId = "chatbox-cuvs";

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
	const request = {
		session: sessionPath,
		queryInput: {
			text: {
				text: 'chào',
				languageCode: 'en-US',
			},
		},
	};

	// Send request and log result
	const responses = await sessionClient.detectIntent(request);
	console.log(responses);
	console.log('Detected intent');
	const result = responses[0].queryResult;
	console.log(`  Query: ${result.queryText}`);
	console.log(`  Response: ${result.fulfillmentText}`);
	if (result.intent) {
		console.log(`  Intent: ${result.intent.displayName}`);
	} else {
		console.log(`  No intent matched.`);
	}
}