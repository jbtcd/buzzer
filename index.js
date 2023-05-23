const WebSocket = require('ws');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const wss = new WebSocket.Server(http);

let current = false;
let time, isRun, sender;

isRun = false;

const clients = new Map();

wss.on('connection', (ws) => {
    const color = Math.floor(Math.random() * 360);
    const metadata = {color};

    clients.set(ws, metadata);
    console.debug('Client Connected!');

    ws.on('message', (data, isBinary) => {
        const message = isBinary ? data : data.toString();
        console.log('Data:', data, 'Data as String:', data.toString());

        if (message === 'button 0') {
            stopRun();
        }

        if (message === 'reset') {
            resetTimer();
        }

        if (message === 'Goooo!') {
            startRun();
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
    });
});

const sendCurrentTime = () => {
    if (isRun === false) {
        return;
    }

    let currentTime = Date.now();
    let timeNeeded = currentTime  - time;

    [...clients.keys()].forEach((client) => {
       client.send(timeNeeded);
    });

    return timeNeeded;
}

const startRun = () => {
    isRun = true;
    time = Date.now();
    console.debug('Start run at:', sendCurrentTime());
    sender = setInterval(sendCurrentTime, 10);
}

const stopRun = () => {
    clearInterval(sender);
    const needed = sendCurrentTime();
    if (needed === undefined) {
        return;
    }
    console.debug('Stop run at:', needed);

    [...clients.keys()].forEach((client) => {
        client.send(needed);
        client.send('new_start_possible');
    });

    isRun = false;
}

const resetTimer = () => {
    clearInterval(sender);

    [...clients.keys()].forEach((client) => {
        client.send(0);
    });
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/display.html');
});

app.get('/start.mp3', (req, res) => {
    res.sendFile(__dirname + '/start.mp3');
});

http.listen(8003, function() {
    console.debug('Server started.');
});
