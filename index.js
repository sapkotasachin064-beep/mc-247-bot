function createBot() {
    botStatus = "Connecting...";
    
    bot = mineflayer.createBot({
        host: 'InfernalVoid.play.hosting', 
        port: 56202, 
        username: 'THE_INFERNAL_VOID',
        version: '1.21.1',
        hideErrors: false
    });

    bot.on('spawn', () => {
        botStatus = "Online & Active";
        bot.chat('/register YourPass123 YourPass123'); 
        bot.chat('/login YourPass123');
    });

    // THIS WILL TELL YOU THE REAL REASON FOR DISCONNECT
    bot.on('kicked', (reason) => {
        botStatus = `Kicked: ${JSON.parse(reason).text || reason}`;
        console.log("Kicked for:", reason);
    });

    bot.on('error', (err) => {
        if (err.code === 'ENOTFOUND') botStatus = "Error: Invalid IP/Host";
        else if (err.code === 'ECONNREFUSED') botStatus = "Error: Server Offline/Wrong Port";
        else botStatus = `Error: ${err.code}`;
    });

    bot.on('end', () => {
        if (!botStatus.includes("Error")) botStatus = "Disconnected. Retrying...";
        setTimeout(createBot, 10000);
    });
}
