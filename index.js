const mineflayer = require('mineflayer');
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

let botStatus = "Offline";
let lastChat = [];
let bot;

function createBot() {
    botStatus = "Connecting...";
    
    // USING THE NUMERIC IP FROM YOUR PRIMARY PORT LIST
    bot = mineflayer.createBot({
        host: '62.141.62.23', 
        port: 22664, 
        username: 'INFERNAL_VOID',
        version: '1.21.1',
        hideErrors: false,
        checkTimeoutInterval: 60000
    });

    bot.on('spawn', () => {
        botStatus = "Online";
        bot.chat('/register Pass1234 Pass1234');
        bot.chat('/login Pass1234');
        
        // Simple arm swing every 20s to stay active
        setInterval(() => { if(botStatus === "Online") bot.swingArm('right'); }, 20000);
    });

    bot.on('chat', (username, message) => {
        const time = new Date().toLocaleTimeString();
        lastChat.push(`[${time}] ${username}: ${message}`);
        if (lastChat.length > 15) lastChat.shift();
    });

    bot.on('error', (err) => {
        botStatus = `Error: ${err.code}`;
        console.log("Internal Error:", err.code);
    });

    bot.on('end', () => {
        botStatus = "Reconnecting...";
        // Standard 10s delay to avoid "Connection Throttled" errors
        setTimeout(createBot, 10000);
    });
}

// THE FIXED GUI
app.get('/', (req, res) => {
    const statusColor = botStatus === "Online" ? "#00ff00" : "#ff0000";
    res.send(`
        <html>
            <head>
                <title>INFERNAL VOID OS</title>
                <style>
                    body { background: #050505; color: #0f0; font-family: 'Segoe UI', monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .panel { width: 90%; max-width: 600px; background: #111; border: 1px solid #333; padding: 20px; box-shadow: 0 0 20px rgba(0,255,0,0.1); }
                    .header { border-bottom: 1px solid #222; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; }
                    .terminal { background: #000; height: 250px; overflow-y: auto; padding: 10px; border-radius: 4px; border: 1px solid #222; font-size: 13px; color: #aaa; }
                    .status-dot { height: 10px; width: 10px; background-color: ${statusColor}; border-radius: 50%; display: inline-block; margin-right: 5px; box-shadow: 0 0 10px ${statusColor}; }
                </style>
            </head>
            <body>
                <div class="panel">
                    <div class="header">
                        <span>>> INFERNAL_VOID_OS_v3</span>
                        <span><span class="status-dot"></span>${botStatus}</span>
                    </div>
                    <div class="terminal" id="log">
                        ${lastChat.length > 0 ? lastChat.map(m => `<p style="margin:2px 0;">${m}</p>`).join('') : '<p style="color:#444">Waiting for logs...</p>'}
                    </div>
                    <p style="font-size: 10px; color: #444; margin-top: 10px;">AUTO-REFRESH ACTIVE (5s)</p>
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
    console.log(`Web Port: ${port}`);
    createBot();
});
