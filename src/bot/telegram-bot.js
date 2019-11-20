import {
    config
} from './config';
import TelegramBot from 'node-telegram-bot-api';

let token = config.TELEGRAM_API_KEY;
let bot = new TelegramBot(token, { polling: false });


let sendMessage = (_msg) => {

    bot.sendMessage(config.TELEGRAM_CHAT_ID, `USDB ArbBot: ${_msg}`);

}

export { sendMessage };