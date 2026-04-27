const mineflayer = require('mineflayer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

let botStatus = "Initializing...";
let lastChat = [];
let bot;

function createBot() {
    // Basic bot configuration
    const botArgs = {
        host: 'InfernalVoid.play.hosting',
        port: 56202, // <--- RE-CHECK THIS IN YOUR PANEL!
        username: 'THE_INFERNAL_VOID',
        version: '1.21.1', // Ensure this matches your server version exactly
        hideErrors: false
    };

    botStatus = "Attempting Connection...";
    bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        botStatus = "Online & Active";
        console.log("Joined the server!");
        
        // Anti-AFK logic
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
                bot.swingArm('right');
            }
        }, 30000);
    });

    bot.on('chat', (username, message) => {
        const time = new Date().toLocaleTimeString();
        lastChat.push(`[${time}] ${username}: ${message}`);
        if (lastChat.length > 20) lastChat.shift();
    });

    bot.on('error', (err) => {
        console.log(`Error: ${err.code}`);
        if (err.code === 'ECONNREFUSED') {
            botStatus = "Error: Connection Refused (Is the port right?)";
        } else {
            botStatus = `Error: ${err.message}`;
        }
    });

    bot.on('kicked', (reason) => {
        botStatus = `Kicked: ${reason}`;
        console.log("Kicked reason:", reason);
    });

    bot.on('end', () => {
        botStatus = "Disconnected. Retrying in 15s...";
        setTimeout(createBot, 15000);
    });
}

// Web Dashboard
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Infernal Void Dashboard</title>
                <style>
                    body { background: #000; color: #0f0; font-family: monospace; padding: 20px; text-align: center; }
                    .status { border: 2px solid #333; padding: 20px; margin-bottom: 20px; font-size: 1.2em; }
                    .log { background: #111; text-align: left; padding: 15px; border: 1px solid #222; height: 300px; overflow-y: auto; color: #888; }
                </style>
            </head>
            <body>
                <h1>>> INFERNAL_VOID_OS</h1>
                <div class="status">SYSTEM_STATUS: <span style="color:white">${botStatus}</span></div>
                <div class="log" id="log">${lastChat.map(m => `<p>${m}</p>`).join('')}</div>
                <script>
                    const l = document.getElementById('log'); l.scrollTop = l.scrollHeight;
                    setTimeout(() => location.reload(), 5000);
                </script>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Web interface active on port ${port}`);
    createBot();
});
