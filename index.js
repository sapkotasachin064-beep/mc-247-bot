const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 8080;

// IMPORTANT: set this to your actual Render URL so the keep-alive ping works
const SELF_URL = process.env.SELF_URL || 'https://mc-247-bot.onrender.com/';

const config = {
    host: 'infernalvoid.mcsh.io',
    username: 'INFERNAL_VOID',
    version: '1.21.1'
};

let bot = null;
let botStatus = 'Offline';
let antiAfkInterval = null;
let reconnectTimeout = null;
let keepAliveInterval = null;

function sendLog(message) {
    const time = new Date().toLocaleTimeString();
    const formatted = `[${time}] ${message}`;

    console.log(formatted);
    io.emit('log', formatted);
}

function updateStatus(status) {
    botStatus = status;
    io.emit('status', status);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function startAntiAFK() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
    }

    antiAfkInterval = setInterval(() => {
        if (!bot || !bot.entity || botStatus !== 'Online') return;

        const action = Math.random();

        try {
            if (action < 0.5) {
                bot.swingArm('right');
                sendLog('AFK: swing arm');
            } else {
                bot.setControlState('jump', true);

                setTimeout(() => {
                    if (bot) {
                        bot.setControlState('jump', false);
                    }
                }, 300);

                sendLog('AFK: jump');
            }
        } catch (err) {
            sendLog(`AFK ERROR: ${err.message}`);
        }
    }, 30000); // every 30 seconds
}

function stopAntiAFK() {
    if (antiAfkInterval) {
        clearInterval(antiAfkInterval);
        antiAfkInterval = null;
    }
}

function scheduleReconnect() {
    if (reconnectTimeout) return;

    sendLog('Reconnecting in 15 seconds...');

    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        createBot();
    }, 15000);
}

// --- Keep-alive: stops Render's free tier from spinning the container down ---
function startKeepAlive() {
    if (keepAliveInterval) return;

    keepAliveInterval = setInterval(() => {
        try {
            const client = SELF_URL.startsWith('https') ? https : http;
            client.get(SELF_URL, res => {
                // Just draining the response so it doesn't hang open
                res.on('data', () => {});
                res.on('end', () => {});
            }).on('error', err => {
                sendLog(`Keep-alive ping failed: ${err.message}`);
            });
        } catch (err) {
            sendLog(`Keep-alive error: ${err.message}`);
        }
    }, 10 * 60 * 1000); // every 10 minutes, well under Render's 15-min sleep window
}

function createBot() {
    stopAntiAFK();

    if (bot) {
        try {
            bot.removeAllListeners();
            bot.quit();
        } catch (e) {}
    }

    updateStatus('Connecting');

    sendLog(
        `Connecting to ${config.host} as ${config.username}...`
    );

    bot = mineflayer.createBot({
        host: config.host,
        username: config.username,
        version: config.version,
        connectTimeout: 30000
    });

    bot.once('spawn', async () => {
        try {
            updateStatus('Online');
            sendLog('Bot spawned successfully.');

            await sleep(3000);

            bot.chat('/login pass1234');
            sendLog('Executed /login');

            await sleep(5000);

            bot.chat('/warp AFK');
            sendLog('Executed /warp AFK');

            await sleep(3000);

            startAntiAFK();
            sendLog('Anti-AFK engine started.');
        } catch (err) {
            sendLog(`Spawn sequence error: ${err.message}`);
        }
    });

    bot.on('chat', (username, message) => {
        sendLog(`<${username}> ${message}`);
    });

    bot.on('message', message => {
        sendLog(`[SERVER] ${message.toString()}`);
    });

    bot.on('kicked', reason => {
        updateStatus('Kicked');
        sendLog(`KICKED: ${JSON.stringify(reason)}`);
        stopAntiAFK();
    });

    // FIX: errors used to just get logged with no recovery path.
    // Now they trigger the same reconnect logic as a clean disconnect.
    bot.on('error', err => {
        updateStatus('Error');
        sendLog(`ERROR: ${err.message}`);
        stopAntiAFK();
        scheduleReconnect();
    });

    bot.on('end', () => {
        updateStatus('Disconnected');
        sendLog('Connection ended.');

        stopAntiAFK();
        scheduleReconnect();
    });
}

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>INFERNAL VOID AFK PANEL</title>
<script src="/socket.io/socket.io.js"></script>
<style>
body{
    background:#050505;
    color:#0f0;
    font-family:Consolas,monospace;
    padding:20px;
}
.box{
    max-width:900px;
    margin:auto;
    border:2px solid #ff4444;
    background:#000;
    padding:20px;
}
.status{
    font-size:24px;
    font-weight:bold;
    margin-bottom:15px;
}
#log{
    height:500px;
    overflow-y:auto;
    border:1px solid #222;
    padding:10px;
    background:#080808;
}
</style>
</head>
<body>
<div class="box">
    <div class="status">
        STATUS:
        <span id="status">LOADING...</span>
    </div>

    <div id="log"></div>
</div>

<script>
const socket = io();

socket.on('status', status => {
    document.getElementById('status').innerText =
        status.toUpperCase();
});

socket.on('log', message => {
    const log = document.getElementById('log');

    log.innerHTML += '<div>' + message + '</div>';
    log.scrollTop = log.scrollHeight;
});
</script>
</body>
</html>
    `);
});

// Simple health-check endpoint (also handy for an external pinger like UptimeRobot)
app.get('/health', (req, res) => {
    res.json({ status: botStatus, uptime: process.uptime() });
});

// --- Crash safety nets: log instead of silently dying ---
process.on('uncaughtException', err => {
    sendLog(`UNCAUGHT EXCEPTION: ${err.message}`);
});

process.on('unhandledRejection', reason => {
    sendLog(`UNHANDLED REJECTION: ${reason}`);
});

server.listen(PORT, () => {
    sendLog('Dashboard started.');
    createBot();
    startKeepAlive();
});
