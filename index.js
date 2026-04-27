const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 8080;

// NEW CONFIG: No port specified to allow SRV lookup
let config = {
    host: 'InfernalVoid.play.hosting',
    username: 'INFERNAL_VOID',
    version: '1.21.1',
    hideErrors: false
};

let bot;
let botStatus = "Offline";

function sendLog(msg) {
    const time = new Date().toLocaleTimeString();
    io.emit('log', `[${time}] ${msg}`);
    console.log(`[${time}] ${msg}`);
}

function createBot() {
    if (bot) {
        bot.removeAllListeners();
        bot.quit();
    }
    
    botStatus = "Connecting...";
    io.emit('status', botStatus);
    sendLog(`Connecting to ${config.host} as ${config.username}...`);

    // Removed port from options to force Mineflayer to resolve SRV records
    bot = mineflayer.createBot({
        host: config.host,
        username: config.username,
        version: config.version,
        connectTimeout: 30000,
        keepAlive: true
    });

    bot.on('spawn', () => {
        botStatus = "Online";
        io.emit('status', botStatus);
        sendLog("SYSTEM: Bot spawned successfully.");
        
        // DIRECT LOGIN COMMAND
        bot.chat('/login Pass1234');
        sendLog("SYSTEM: Sent login command.");

        // ANTI-AFK ACTIVITY
        setInterval(() => {
            if (botStatus === "Online") {
                bot.swingArm('right');
                bot.look(bot.entity.yaw + 0.1, 0);
            }
        }, 25000);
    });

    bot.on('chat', (username, message) => {
        sendLog(`<${username}> ${message}`);
    });

    bot.on('error', (err) => {
        botStatus = "Error";
        io.emit('status', botStatus);
        sendLog(`CRITICAL ERROR: ${err.message}`);
    });

    bot.on('kicked', (reason) => {
        botStatus = "Kicked";
        io.emit('status', botStatus);
        sendLog(`KICKED: ${reason}`);
    });

    bot.on('end', () => {
        botStatus = "Reconnecting";
        io.emit('status', botStatus);
        sendLog("Connection ended. Retrying in 15 seconds...");
        setTimeout(createBot, 15000);
    });
}

// GUI AND SOCKET LOGIC
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>INFERNAL VOID | DIRECT CONNECT</title>
                <script src="/socket.io/socket.io.js"></script>
                <style>
                    body { background: #000; color: #0f0; font-family: 'Courier New', monospace; padding: 20px; }
                    .box { border: 2px solid #ff4444; padding: 20px; background: #050505; max-width: 900px; margin: auto; }
                    #log { height: 350px; overflow-y: auto; border: 1px solid #222; padding: 10px; margin: 10px 0; color: #ccc; background: #000; font-size: 12px; }
                    input { background: #000; border: 1px solid #ff4444; color: #fff; padding: 8px; width: 300px; }
                    .btn { background: #ff4444; color: #000; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; }
                    .status-line { font-size: 22px; font-weight: bold; color: #fff; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="box">
                    <div class="status-line">OS_STATUS: <span id="st">BOOTING</span></div>
                    <div id="log"></div>
                    <p style="color: #444;">Connected Host: <strong>${config.host}</strong> | User: <strong>${config.username}</strong></p>
                    <div style="border-top: 1px solid #222; padding-top: 10px;">
                        <input type="text" id="ip" value="${config.host}" placeholder="Change IP/Domain"> 
                        <button class="btn" onclick="update()">UPDATE HOST</button>
                    </div>
                </div>
                <script>
                    const socket = io();
                    socket.on('log', (m) => {
                        const d = document.getElementById('log');
                        d.innerHTML += '<p style="margin:2px">'+m+'</p>';
                        d.scrollTop = d.scrollHeight;
                    });
                    socket.on('status', (s) => { document.getElementById('st').innerText = s.toUpperCase(); });
                    function update() {
                        socket.emit('up', { h: document.getElementById('ip').value });
                    }
                </script>
            </body>
        </html>
    `);
});

io.on('connection', (s) => {
    s.on('up', (d) => {
        config.host = d.h;
        sendLog(`MANUAL OVERRIDE: Changing host to ${d.h}`);
        createBot();
    });
});

server.listen(port, () => {
    sendLog("INFERNAL_VOID_OS initialized. Dashboard live.");
    createBot();
});
