require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN environment variable is required');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Store for crypto price alerts: { chatId: { crypto: string, price: number, direction: 'above'|'below' } }
const cryptoAlerts = new Map();

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
/btcprice - Get current BTC price
/ethprice - Get current ETH price
/btcalert <price> <above|below> - Set BTC price alert
/ethalert <price> <above|below> - Set ETH price alert
/checkalerts - Check your active alerts
/removealert - Remove your active alert

例如: /btcalert 50000 above 或 /ethalert 3000 below
`;
    bot.sendMessage(chatId, helpText);
});

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    bot.sendMessage(chatId, resp);
});

bot.onText(/\/btcprice/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const currentPrice = await getCurrentBTCPrice();
        if (currentPrice === null) {
            bot.sendMessage(chatId, '无法获取当前BTC价格，请稍后重试');
            return;
        }
        
        bot.sendMessage(chatId, `💰 当前BTC价格: $${currentPrice.toLocaleString()}`);
    } catch (error) {
        bot.sendMessage(chatId, '获取BTC价格时出错');
        console.error('Error getting BTC price:', error);
    }
});

bot.onText(/\/ethprice/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const currentPrice = await getCurrentETHPrice();
        if (currentPrice === null) {
            bot.sendMessage(chatId, '无法获取当前ETH价格，请稍后重试');
            return;
        }
        
        bot.sendMessage(chatId, `💎 当前ETH价格: $${currentPrice.toLocaleString()}`);
    } catch (error) {
        bot.sendMessage(chatId, '获取ETH价格时出错');
        console.error('Error getting ETH price:', error);
    }
});

async function getCurrentPrice(crypto) {
    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=usd`);
        const price = response.data[crypto].usd;
        return price;
    } catch (error) {
        console.error(`Error fetching ${crypto.toUpperCase()} price:`, error);
        return null;
    }
}

async function getCurrentBTCPrice() {
    return await getCurrentPrice('bitcoin');
}

async function getCurrentETHPrice() {
    return await getCurrentPrice('ethereum');
}

bot.onText(/\/btcalert (\d+(?:\.\d+)?) (above|below)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const targetPrice = parseFloat(match[1]);
    const direction = match[2];
    
    if (isNaN(targetPrice) || targetPrice <= 0) {
        bot.sendMessage(chatId, '请输入有效的价格，例如: /btcalert 50000 above');
        return;
    }
    
    try {
        const currentPrice = await getCurrentBTCPrice();
        if (currentPrice === null) {
            bot.sendMessage(chatId, '无法获取当前BTC价格，请稍后重试');
            return;
        }
        
        cryptoAlerts.set(chatId, { crypto: 'bitcoin', price: targetPrice, direction: direction });
        
        bot.sendMessage(chatId, 
            `✅ BTC价格提醒已设置！\n` +
            `🎯 目标价格: $${targetPrice.toLocaleString()}\n` +
            `📊 当前价格: $${currentPrice.toLocaleString()}\n` +
            `🔔 提醒条件: 当价格${direction === 'above' ? '高于' : '低于'}目标价格时通知您`
        );
    } catch (error) {
        bot.sendMessage(chatId, '设置提醒时出错，请重试');
        console.error('Error setting BTC alert:', error);
    }
});

bot.onText(/\/ethalert (\d+(?:\.\d+)?) (above|below)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const targetPrice = parseFloat(match[1]);
    const direction = match[2];
    
    if (isNaN(targetPrice) || targetPrice <= 0) {
        bot.sendMessage(chatId, '请输入有效的价格，例如: /ethalert 3000 above');
        return;
    }
    
    try {
        const currentPrice = await getCurrentETHPrice();
        if (currentPrice === null) {
            bot.sendMessage(chatId, '无法获取当前ETH价格，请稍后重试');
            return;
        }
        
        cryptoAlerts.set(chatId, { crypto: 'ethereum', price: targetPrice, direction: direction });
        
        bot.sendMessage(chatId, 
            `✅ ETH价格提醒已设置！\n` +
            `🎯 目标价格: $${targetPrice.toLocaleString()}\n` +
            `📊 当前价格: $${currentPrice.toLocaleString()}\n` +
            `🔔 提醒条件: 当价格${direction === 'above' ? '高于' : '低于'}目标价格时通知您`
        );
    } catch (error) {
        bot.sendMessage(chatId, '设置提醒时出错，请重试');
        console.error('Error setting ETH alert:', error);
    }
});

bot.onText(/\/checkalerts/, async (msg) => {
    const chatId = msg.chat.id;
    const alert = cryptoAlerts.get(chatId);
    
    if (!alert) {
        bot.sendMessage(chatId, '您目前没有设置任何加密货币价格提醒');
        return;
    }
    
    try {
        const currentPrice = await getCurrentPrice(alert.crypto);
        if (currentPrice === null) {
            bot.sendMessage(chatId, '无法获取当前价格');
            return;
        }
        
        const cryptoName = alert.crypto === 'bitcoin' ? 'BTC' : 'ETH';
        bot.sendMessage(chatId,
            `📋 您的${cryptoName}价格提醒:\n` +
            `🎯 目标价格: $${alert.price.toLocaleString()}\n` +
            `📊 当前价格: $${currentPrice.toLocaleString()}\n` +
            `🔔 提醒条件: 当价格${alert.direction === 'above' ? '高于' : '低于'}目标价格时通知您`
        );
    } catch (error) {
        bot.sendMessage(chatId, '检查提醒时出错');
        console.error('Error checking alerts:', error);
    }
});

bot.onText(/\/removealert/, (msg) => {
    const chatId = msg.chat.id;
    
    if (cryptoAlerts.has(chatId)) {
        cryptoAlerts.delete(chatId);
        bot.sendMessage(chatId, '✅ 您的价格提醒已删除');
    } else {
        bot.sendMessage(chatId, '您目前没有设置任何价格提醒');
    }
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    
    if (!messageText.startsWith('/')) {
        bot.sendMessage(chatId, `You said: ${messageText}`);
    }
});

async function checkPriceAlerts() {
    if (cryptoAlerts.size === 0) {
        return;
    }
    
    try {
        for (const [chatId, alert] of cryptoAlerts) {
            const { crypto, price: targetPrice, direction } = alert;
            
            const currentPrice = await getCurrentPrice(crypto);
            if (currentPrice === null) {
                console.log(`Failed to fetch current ${crypto} price for alert checking`);
                continue;
            }
            
            let shouldAlert = false;
            
            if (direction === 'above' && currentPrice >= targetPrice) {
                shouldAlert = true;
            } else if (direction === 'below' && currentPrice <= targetPrice) {
                shouldAlert = true;
            }
            
            if (shouldAlert) {
                const cryptoName = crypto === 'bitcoin' ? 'BTC' : 'ETH';
                const emoji = crypto === 'bitcoin' ? '💰' : '💎';
                const message = 
                    `🚨 ${cryptoName}价格提醒！\n` +
                    `${emoji} 当前价格: $${currentPrice.toLocaleString()}\n` +
                    `🎯 您设置的目标价格: $${targetPrice.toLocaleString()}\n` +
                    `✅ 价格已${direction === 'above' ? '高于' : '低于'}您设置的目标价格！`;
                
                try {
                    await bot.sendMessage(chatId, message);
                    cryptoAlerts.delete(chatId);
                    console.log(`${cryptoName} alert sent to ${chatId} and removed`);
                } catch (error) {
                    console.error(`Failed to send alert to ${chatId}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error checking price alerts:', error);
    }
}

setInterval(checkPriceAlerts, 60000);

console.log('Bot is running...');