require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN environment variable is required');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome! I am your Telegram bot. Type /help to see available commands.');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
Available commands:
/start - Start the bot
/help - Show this help message
/echo <message> - Echo your message back
`;
    bot.sendMessage(chatId, helpText);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    
    if (!messageText.startsWith('/')) {
        bot.sendMessage(chatId, `You said: ${messageText}`);
    }
});

console.log('Bot is running...');