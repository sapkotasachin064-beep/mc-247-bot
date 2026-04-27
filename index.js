const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 8080;

let config = {
    host: 'InfernalVoid.play.hosting',
    username: 'INFERNAL_VOID',
    version: '1.21.1'
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
        sendLog("SYSTEM: Bot spawned. Starting AFK Sequence...");
        
        // --- STEP 1: LOGIN ---
        setTimeout(() => {
            bot.chat('/login Pass1234');
            sendLog("SYSTEM: Executed /login.");
        }, 2000);

        // --- STEP 2: WARP TO AFK ---
        setTimeout(() => {
            bot.chat('/warp AFK');
            sendLog("SYSTEM: Executed /warp AFK.");
        }, 5000);

        // --- STEP 3: GO TO COORDINATES ---
        // Replace X, Y, Z with your actual numbers
        setTimeout(() => {
            const x = 100; // Put your X here
            const y = 64;  // Put your Y here
            const z = 100; // Put your Z here
            
            // This makes the bot look at the spot and walk there (requires pathfinding)
            // For simple "Snap to position", we use this:
            bot.chat(`/tp ${x} ${y} ${z}`);
            sendLog(`SYSTEM: Moved to AFK Coordinates (${x}, ${y}, ${z}).`);
        }, 8000);
    });

    // --- ADVANCED ANTI-AFK ENGINE ---
    setInterval(() => {
        if (botStatus === "Online" && bot.entity) {
            // Randomly pick an action to look like a human
            const roll = Math.random();
            if (roll < 0.3) {
                bot.swingArm('right');
            } else if (roll < 0.6) {
                const yaw = bot.entity.yaw + (Math.random() * 0.5 - 0.25);
                const pitch = (Math.random() * 0.2 - 0.1);
                bot.look(yaw, pitch);
            } else {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }
    }, 20000); // Runs every 20 seconds

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

// DASHBOARD GUI
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>INFERNAL VOID | ELITE AFK</title>
                <script src="/socket.io/socket.io.js"></script>
                <style>
                    body { background: #050505; color: #0f0; font-family: 'Courier New', monospace; padding: 20px; }
                    .box { border: 2px solid #ff4444; padding: 20px; background: #000; max-width: 900px; margin: auto; box-shadow: 0 0 20px rgba(255,0,0,0.4); }
                    #log { height: 400px; overflow-y: auto; border: 1px solid #111; padding: 10px; margin: 10px 0; color: #aaa; background: #080808; font-size: 12px; }
                    .status-line { font-size: 24px; font-weight: bold; color: #fff; text-shadow: 2px 2px #ff4444; }
                </style>
            </head>
            <body>
                <div class="box">
                    <div class="status-line">>> SYSTEM_OS: <span id="st">LOADING</span></div>
                    <div id="log"></div>
                    <div style="color:#444; font-size:10px;">AUTO-AFK ACTIVE: SWING | LOOK | JUMP</div>
                </div>
                <script>
                    const socket = io();
                    socket.on('log', (m) => {
                        const d = document.getElementById('log');
                        d.innerHTML += '<p style="margin:2px">> '+m+'</p>';
                        d.scrollTop = d.scrollHeight;
                    });
                    socket.on('status', (s) => { document.getElementById('st').innerText = s.toUpperCase(); });
                </script>
            </body>
        </html>
    `);
});

server.listen(port, () => {
    sendLog("INFERNAL_VOID_OS initialized. Elite AFK Mode Engaged.");
    createBot();
});
