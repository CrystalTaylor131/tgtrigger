# TGTrigger - Cryptocurrency Price Alert Telegram Bot

A Telegram bot that provides real-time cryptocurrency prices and customizable price alerts for Bitcoin (BTC) and Ethereum (ETH).

## Features

- **Real-time Price Queries**: Get current BTC and ETH prices
- **Price Alerts**: Set up alerts to be notified when crypto prices go above or below your target
- **Simple Commands**: Easy-to-use command interface
- **Multi-language Support**: Commands in English with Chinese notifications

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/start` | Initialize the bot | `/start` |
| `/help` | Show available commands | `/help` |
| `/echo <message>` | Echo your message back | `/echo Hello World` |
| `/btcprice` | Get current BTC price | `/btcprice` |
| `/ethprice` | Get current ETH price | `/ethprice` |
| `/btcalert <price> <above\|below>` | Set BTC price alert | `/btcalert 50000 above` |
| `/ethalert <price> <above\|below>` | Set ETH price alert | `/ethalert 3000 below` |
| `/checkalerts` | View your active alerts | `/checkalerts` |
| `/removealert` | Remove your active alert | `/removealert` |

## Prerequisites

- Node.js (v14 or higher)
- A Telegram Bot Token from [@BotFather](https://t.me/botfather)

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd tgtrigger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   ```

4. Replace `your_bot_token_here` with your actual Telegram bot token.

## Usage

1. Start the bot:
   ```bash
   node index.js
   ```

2. Open Telegram and search for your bot
3. Start a conversation with `/start`
4. Use `/help` to see all available commands

## How It Works

- **Price Data**: Uses the CoinGecko API to fetch real-time cryptocurrency prices
- **Alerts**: Monitors prices every 60 seconds and sends notifications when targets are reached
- **Storage**: Stores alerts in memory (resets on bot restart)

## Dependencies

- `node-telegram-bot-api`: Telegram Bot API wrapper
- `axios`: HTTP client for API requests
- `dotenv`: Environment variable management

## API Reference

This bot uses the [CoinGecko API](https://www.coingecko.com/en/api) to fetch cryptocurrency prices:
- Endpoint: `https://api.coingecko.com/api/v3/simple/price`
- No API key required
- Free tier with rate limits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC License