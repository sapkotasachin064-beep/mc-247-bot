Great job fixing the `cron-job.org` error! Getting everything synced up can be a bit tricky, but you're on the right track now.

Here is a complete, professional, and step-by-step `README.md` designed specifically for your **mc-247-bot** repository. It covers everything from local setup to Render deployment and the `cron-job.org` keep-alive trick.

You can copy the entire code block below and paste it directly into your `README.md` file.

```markdown
# 🎮 Minecraft 24/7 AFK Bot (`mc-247-bot`)

A lightweight, automated Minecraft AFK bot built with Node.js and **Mineflayer**. This project is specifically configured to run **24/7 completely free** on cloud platforms like Render by utilizing a built-in Express web server and an external cron ping service.

## 🚀 Features
* **24/7 Activity:** Bypasses hosting sleep timers using a built-in web server.
* **Anti-AFK Actions:** Performs minor actions (like jumping or moving) periodically to prevent getting kicked by the Minecraft server.
* **Auto-Reconnect:** Automatically detects server restarts or disconnections and attempts to reconnect instantly.
* **Environment Configuration:** Keeps your server IP and bot credentials completely secure using `.env` variables.

---

## 🛠️ Step 1: Local Installation & Configuration

Before hosting the bot online, make sure it is configured correctly on your local machine.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/sapkotasachin064-beep/mc-247-bot.git](https://github.com/sapkotasachin064-beep/mc-247-bot.git)
   cd mc-247-bot

```

2. **Install the required packages:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env` file in the root directory of the project and add your Minecraft server details:
```env
PORT=3000
BOT_USERNAME=My247Bot
SERVER_IP=your.server.ip.or.domain
SERVER_PORT=25565
MINECRAFT_VERSION=1.20.1
AUTH_TYPE=offline

```


*(Change `AUTH_TYPE` to `microsoft` if you are using a premium, paid Minecraft account).*
4. **Test the bot locally:**
```bash
node index.js

```



---

## ☁️ Step 2: Hosting 24/7 on Render (Free Tier)

Render's free tier puts applications to sleep if they do not receive web traffic for 15 minutes. Because this bot contains an Express server, we can bypass this constraint.

1. Commit your latest code changes and push them back up to your GitHub repository.
2. Go to [Render Dashboard](https://dashboard.render.com/) and log in.
3. Click **New +** and select **Web Service**.
4. Connect your GitHub account and select the `mc-247-bot` repository.
5. Configure the following deployment settings:
* **Name:** `mc-247-bot`
* **Language:** `Node`
* **Build Command:** `npm install`
* **Start Command:** `node index.js`


6. Scroll down to **Advanced** -> **Environment Variables** and add all the configuration pairs from your local `.env` file (`SERVER_IP`, `BOT_USERNAME`, etc.).
7. Click **Deploy Web Service**.
8. Once the build finishes, copy your live Render URL from the top left corner (e.g., `https://mc-247-bot.onrender.com`).

---

## ⏱️ Step 3: Keeping the Bot Awake 24/7 with cron-job.org

To prevent Render from putting your bot to sleep after 15 minutes of inactivity, you must force an external service to ping your web server.

1. Go to [cron-job.org](https://cron-job.org/) and create a free account.
2. Navigate to the **Cron Jobs** tab and click **Create Cron Job**.
3. Fill out the details as follows:
* **Title:** `Keep Minecraft Bot Awake`
* **Address (URL):** Paste your live Render web service URL here.
* **Execution Schedule:** Select **Every 1 minute** (or every 2 minutes).


4. Click **Create**.

Your cron job will now ping your Render app every minute. Render will view this as active web traffic and will keep your Minecraft bot online and running inside your chosen server indefinitely!

---

## 🔒 Security Reminder

Never commit your raw password or server IP directly into your `index.js` file. Always use the `.env` file or Render's Environment Variables dashboard to keep your credentials safe from public view.

```

---

### How to update this on your GitHub:
1. Open the project folder on your computer.
2. Create or open the existing `README.md` file.
3. Delete everything inside it, paste the markdown code block above, and save it.
4. Open your terminal in that folder and run these three commands:
   ```bash
   git add README.md
   git commit -m "Update README with detailed 24/7 setup instructions"
   git push origin main

```

Your GitHub repository page will now look super organized and give you a clean blueprint to reference whenever you need to configure or update your bot!
