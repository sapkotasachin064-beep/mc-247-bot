const mineflayer = require('mineflayer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

let botStatus = "System Starting...";
let lastChat = [];
let bot;

function createBot() {
    botStatus = "Connecting...";
    
    // Replace with your current Server IP and Port
    const botArgs = {
        host: 'InfernalVoid.play.hosting',
        port: 56202, 
        username: 'THE_INFERNAL_VOID',
        version: '1.21.1',
        hideErrors: true
    };

    bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        botStatus = "Online";
        console.log("Bot Spawned!");
        // Auto-login/register
        bot.chat('/register Pass1234 Pass1234');
        bot.chat('/login Pass1234');
    });

    bot.on('chat', (username, message) => {
        lastChat.push(`${username}: ${message}`);
        if (lastChat.length > 15) lastChat.shift();
    });

    bot.on('error', (err) => {
        botStatus = `Error: ${err.code || 'Failed'}`;
    });

    bot.on('kicked', (reason) => {
        botStatus = "Kicked from Server";
        console.log("Kicked:", reason);
    });

    bot.on('end', () => {
        botStatus = "Disconnected. Reconnecting...";
        setTimeout(createBot, 5000); // Reconnect faster (5 seconds)
    });
}

// Web UI with Terminal Look
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Infernal OS</title>
                <style>
                    body { background: #000; color: #0f0; font-family: monospace; padding: 20px; }
                    .status-bar { border: 1px solid #333; padding: 10px; margin-bottom: 10px; color: #fff; }
                    .terminal { background: #050505; border: 1px solid #222; height: 300px; padding: 10px; overflow-y: auto; }
                    .input-area { margin-top: 10px; }
                    input { background: #000; border: 1px solid #0f0; color: #0f0; width: 80%; padding: 5px; }
                </style>
            </head>
            <body>
                <h2>> INFERNAL_VOID_CONSOLE v2.0</h2>
                <div class="status-bar">STATUS: ${botStatus}</div>
                <div class="terminal" id="term">${lastChat.map(m => `<p>${m}</p>`).join('')}</div>
                <div class="input-area">
                    <input type="text" id="cmd" placeholder="Type command here..." />
                    <button onclick="location.reload()" style="background:#0f0; color:#000;">REFRESH</button>
                </div>
                <script>
                    const t = document.getElementById('term'); t.scrollTop = t.scrollHeight;
                    setTimeout(() => location.reload(), 5000);
                </script>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Web UI live on port ${port}`);
    createBot();
});
