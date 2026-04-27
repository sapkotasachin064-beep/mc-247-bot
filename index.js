const mineflayer = require('mineflayer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

let botStatus = "System Booting...";
let lastChat = [];
let bot;

function createBot() {
    botStatus = "Connecting to 62.141.62.23:22664...";
    
    bot = mineflayer.createBot({
        host: '62.141.62.23', 
        port: 22664, 
        username: 'THE_INFERNAL_VOID',
        version: '1.21.1', // Ensure this matches your server!
        hideErrors: false
    });

    bot.on('spawn', () => {
        botStatus = "Online & Active";
        console.log("Bot joined the server.");
        // Auto-Login
        bot.chat('/register Pass1234 Pass1234');
        bot.chat('/login Pass1234');

        // Simple Anti-AFK
        setInterval(() => {
            if (botStatus === "Online & Active") {
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
        botStatus = `Error: ${err.code}`;
        console.log("Connection Error:", err);
    });

    bot.on('kicked', (reason) => {
        botStatus = "Kicked: Check Server Console";
        console.log("Kicked for:", reason);
    });

    bot.on('end', () => {
        botStatus = "Reconnecting in 10s...";
        setTimeout(createBot, 10000);
    });
}

// GUI Dashboard
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Infernal Void Panel</title>
                <style>
                    body { background: #0a0a0a; color: #00ff00; font-family: 'Courier New', monospace; padding: 20px; }
                    .card { border: 1px solid #333; padding: 20px; max-width: 700px; margin: auto; box-shadow: 0 0 15px #ff000033; }
                    .status { font-size: 18px; margin-bottom: 20px; color: #fff; border-bottom: 1px solid #222; padding-bottom: 10px; }
                    .console { background: #000; height: 300px; overflow-y: auto; padding: 10px; border: 1px solid #111; font-size: 13px; color: #888; }
                    .btn { background: #ff4444; color: #000; border: none; padding: 10px; cursor: pointer; font-weight: bold; margin-top: 10px; width: 100%; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>>> INFERNAL_VOID_OS</h2>
                    <div class="status">STATUS: <span style="color:#0f0">${botStatus}</span></div>
                    <div class="console" id="log">
                        ${lastChat.map(m => `<p>${m}</p>`).join('')}
                    </div>
                    <button class="btn" onclick="location.reload()">FORCE REFRESH GUI</button>
                </div>
                <script>
                    const l = document.getElementById('log'); l.scrollTop = l.scrollHeight;
                    setTimeout(() => location.reload(), 5000);
                </script>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Web interface live on ${port}`);
    createBot();
});
