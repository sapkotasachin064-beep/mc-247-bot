const mineflayer = require('mineflayer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

let botStatus = "Offline";
let lastChat = [];
let bot;

function createBot() {
    botStatus = "Connecting...";
    
    bot = mineflayer.createBot({
        host: 'InfernalVoid.play.hosting', 
        port: 56202, // double check this in your panel!
        username: 'THE_INFERNAL_VOID',
        version: '1.21.1',
        hideErrors: false
    });

    bot.on('spawn', () => {
        botStatus = "Online & Active";
        console.log("Bot joined the Void.");
        bot.chat('/register yourpassword yourpassword'); 
        bot.chat('/login yourpassword');

        // Random Anti-AFK
        setInterval(() => {
            if (botStatus === "Online & Active") {
                const actions = ['jump', 'forward', 'back', 'left', 'right'];
                const randomAction = actions[Math.floor(Math.random() * actions.length)];
                bot.setControlState(randomAction, true);
                setTimeout(() => bot.setControlState(randomAction, false), 500);
                bot.look(Math.random() * 360, 0);
                bot.swingArm('right');
            }
        }, 30000);
    });

    bot.on('chat', (username, message) => {
        const time = new Date().toLocaleTimeString();
        lastChat.push(`[${time}] <${username}> ${message}`);
        if (lastChat.length > 15) lastChat.shift();
    });

    bot.on('error', (err) => {
        botStatus = `Error: ${err.message}`;
        console.log("Error:", err);
    });

    bot.on('end', () => {
        botStatus = "Disconnected. Retrying...";
        setTimeout(createBot, 10000);
    });
}

// ADVANCED UI
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Infernal Void | Control</title>
                <style>
                    body { background: #0a0a0a; color: #00ff00; font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
                    .container { max-width: 800px; margin: auto; border: 1px solid #333; padding: 20px; box-shadow: 0 0 20px rgba(255,0,0,0.2); }
                    .status-box { border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .console { background: #000; padding: 15px; height: 300px; overflow-y: auto; border: 1px solid #222; color: #aaa; font-size: 14px; }
                    .tag { color: #ff4444; font-weight: bold; }
                    .btn { background: #ff4444; color: white; border: none; padding: 10px 20px; cursor: pointer; font-family: inherit; margin-top: 10px; }
                    .btn:hover { background: #cc0000; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1><span class="tag">>></span> THE_INFERNAL_VOID_CONSOLE</h1>
                    <div class="status-box">
                        STATUS: <span style="color: ${botStatus.includes('Online') ? '#00ff00' : '#ff4444'}">${botStatus}</span>
                    </div>
                    <h3>LIVE_CHAT_FEED:</h3>
                    <div class="console" id="console">
                        ${lastChat.map(m => `<p>${m}</p>`).join('')}
                    </div>
                    <button class="btn" onclick="location.reload()">REFRESH SYSTEM</button>
                </div>
                <script>
                    const c = document.getElementById('console');
                    c.scrollTop = c.scrollHeight;
                    setTimeout(() => location.reload(), 5000);
                </script>
            </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`System Live on ${port}`);
    createBot();
});
