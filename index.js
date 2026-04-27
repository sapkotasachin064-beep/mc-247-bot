const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 8080;

// Default Config (Updated to your Primary IP)
let config = {
    host: '62.141.62.23',
    port: 22664,
    username: 'INFERNAL_VOID',
    version: '1.21.1'
};

let bot;
let botStatus = "Offline";

function sendLog(msg) {
    const time = new Date().toLocaleTimeString();
    const formattedMsg = `[${time}] ${msg}`;
    console.log(formattedMsg);
    io.emit('log', formattedMsg); // Streams log to web UI
}

function createBot() {
    if (bot) bot.quit();
    
    botStatus = "Connecting...";
    io.emit('status', botStatus);
    sendLog(`Attempting connection to ${config.host}:${config.port}...`);

    bot = mineflayer.createBot(config);

    bot.on('spawn', () => {
        botStatus = "Online";
        io.emit('status', botStatus);
        sendLog("Successfully spawned in the world.");
        bot.chat('/login Pass1234');
    });

    bot.on('chat', (username, message) => {
        sendLog(`<${username}> ${message}`);
    });

    bot.on('error', (err) => {
        botStatus = "Error";
        io.emit('status', botStatus);
        sendLog(`System Error: ${err.message}`);
    });

    bot.on('kicked', (reason) => {
        botStatus = "Kicked";
        io.emit('status', botStatus);
        sendLog(`Kicked from server: ${reason}`);
    });

    bot.on('end', () => {
        botStatus = "Disconnected";
        io.emit('status', botStatus);
        sendLog("Connection lost. Retrying in 10s...");
        setTimeout(createBot, 10000);
    });
}

// WEB DASHBOARD HTML
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>INFERNAL VOID | OS v4</title>
                <script src="/socket.io/socket.io.js"></script>
                <style>
                    body { background: #080808; color: #0f0; font-family: 'Consolas', monospace; padding: 20px; }
                    .grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; max-width: 1000px; margin: auto; }
                    .console { background: #000; border: 1px solid #333; height: 400px; overflow-y: auto; padding: 15px; font-size: 13px; color: #ccc; }
                    .sidebar { background: #111; padding: 15px; border: 1px solid #333; }
                    input { background: #000; border: 1px solid #444; color: #0f0; width: 100%; padding: 8px; margin-bottom: 10px; }
                    .btn { background: #0f0; color: #000; border: none; width: 100%; padding: 10px; font-weight: bold; cursor: pointer; }
                    .status { font-size: 20px; margin-bottom: 20px; color: #fff; }
                </style>
            </head>
            <body>
                <h1 style="text-align:center; color:#ff4444;">>> INFERNAL_VOID_REALTIME_OS</h1>
                <div class="grid">
                    <div class="console" id="logBox"></div>
                    <div class="sidebar">
                        <div class="status">STATUS: <span id="statText">${botStatus}</span></div>
                        <label>Target IP:</label>
                        <input type="text" id="ipInput" value="${config.host}">
                        <label>Target Port:</label>
                        <input type="text" id="portInput" value="${config.port}">
                        <button class="btn" onclick="updateConfig()">UPDATE & RECONNECT</button>
                    </div>
                </div>

                <script>
                    const socket = io();
                    const logBox = document.getElementById('logBox');
                    
                    socket.on('log', (msg) => {
                        const p = document.createElement('p');
                        p.textContent = msg;
                        p.style.margin = '2px 0';
                        logBox.appendChild(p);
                        logBox.scrollTop = logBox.scrollHeight;
                    });

                    socket.on('status', (s) => {
                        document.getElementById('statText').textContent = s;
                    });

                    function updateConfig() {
                        const newIp = document.getElementById('ipInput').value;
                        const newPort = document.getElementById('portInput').value;
                        socket.emit('updateConfig', { host: newIp, port: parseInt(newPort) });
                        alert("Settings updated. Reconnecting...");
                    }
                </script>
            </body>
        </html>
    `);
});

// Real-time config updates via Socket
io.on('connection', (socket) => {
    socket.on('updateConfig', (data) => {
        config.host = data.host;
        config.port = data.port;
        sendLog(`Config updated by user to ${config.host}:${config.port}`);
        createBot(); // Re-trigger connection with new IP
    });
});

server.listen(port, () => {
    console.log(`System Online on port ${port}`);
    createBot();
});
