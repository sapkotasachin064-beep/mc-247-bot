const mineflayer = require('mineflayer');

function createBot() {
    const bot = mineflayer.createBot({
        host: 'YOUR_SERVER_IP', // <--- REPLACE THIS
        port: 25565,             // <--- CHANGE IF YOUR PORT IS DIFFERENT
        username: 'StayAlive_Bot',
        version: '1.21.1'        // <--- MATCH YOUR SERVER VERSION
    });

    bot.on('spawn', () => {
        console.log("Bot joined! Server is now 24/7.");
        // Anti-AFK movement every 30 seconds
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
        }, 30000);
    });

    bot.on('end', () => {
        console.log("Disconnected. Reconnecting in 10s...");
        setTimeout(createBot, 10000);
    });

    bot.on('error', (err) => console.log(err));
}

// Simple web server to keep Render happy
const http = require('http');
http.createServer((req, res) => { res.write("Bot is running!"); res.end(); }).listen(8080);

createBot();
