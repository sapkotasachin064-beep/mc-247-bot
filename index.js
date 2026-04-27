const mineflayer = require('mineflayer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

let botStatus = "Offline";
let lastChat = [];

function createBot() {
    const bot = mineflayer.createBot({
        host: 'InfernalVoid.play.hosting',
        port: 2520,
        username: 'THE_INFERNAL_VOID',
        version: '1.21.1',
        hideErrors: true
    });

    bot.on('spawn', () => {
        botStatus = "Online & Active";
        console.log("Bot joined the Void.");
        
        // AUTO-LOGIN (Change 'yourpassword' below)
        bot.chat('/register yourpassword yourpassword'); 

        // ADVANCED ANTI-AFK (Randomized)
        setInterval(() => {
            const actions = ['jump', 'forward', 'back', 'left', 'right'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            bot.setControlState(randomAction, true);
            setTimeout(() => bot.setControlState(randomAction, false), 1000);
            bot.look(Math.random() * 360, 0); // Look around randomly
            bot.swingArm('right'); // Swing arm
        }, 45000);
    });

    bot.on('chat', (username, message) => {
        lastChat.push(`[${username}]: ${message}`);
        if (lastChat.length > 10) lastChat.shift();
    });

    bot.on('end', () => {
        botStatus = "Reconnecting...";
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => {
        botStatus = `Error: ${err.message}`;
    });
}

// WEB UI DASHBOARD
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Infernal Void Bot</title></head>
            <body style="background:#121212; color:white; font-family:sans-serif; text-align:center;">
                <h1>THE_INFERNAL_VOID Console</h1>
                <div style="padding:20px; border:2px solid #ff4444; display:inline-block;">
                    Status: <span style="color:#00ff00">${botStatus}</span>
                </div>
                <h3>Recent Chat:</h3>
                <div style="background:#000; padding:10px; text-align:left; max-width:500px; margin:auto;">
                    ${lastChat.map(m => `<p>${m}</p>`).join('')}
                </div>
                <script>setTimeout(() => location.reload(), 5000);</script>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`UI Dashboard live on port ${port}`);
    createBot();
});
