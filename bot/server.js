const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN not set!');
  process.exit(1);
}

console.log('🔑 Bot token loaded, length:', BOT_TOKEN.length);
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// In-memory storage
const imageStorage = new Map();
const pendingForwards = new Map();

console.log('🌸 Enkutatash Bot starting...');

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || 'User';
  bot.sendMessage(chatId,
    `🌸 እንኳን በደመር ደህና መጡ!\n\n` +
    `ሰላም ${name}!\n\n` +
    `የእንኳን በደመር ማዕበል መሳፈሪያ ነው!\n\n` +
    `📥 ቅርዓት ለማስቀምጥ: ቅርዓቱን ይላኩ!\n` +
    `📤 /send ቁጥር - ቅርዓት ላክ\n` +
    `📋 /list - ያስቀመጡትን ይመልከቱ\n` +
    `🗑️ /delete ቁጥር - ቅርዓት ያጥፉ\n` +
    `❓ /help - እርዳታ`
  );
  console.log('🚀 /start from', msg.from?.id);
});

// /help
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📖 የBot መመሪያ:\n\n` +
    `1️⃣ ቅርዓት ለማስቀምጥ:\n` +
    `   ቅርዓቱን ይላኩ!\n\n` +
    `2️⃣ ቅርዓት ለማካፈል:\n` +
    `   /send 1\n\n` +
    `3️⃣ ያስቀመጡትን ለማየት:\n` +
    `   /list\n\n` +
    `4️⃣ ቅርዓት ለማጥፋት:\n` +
    `   /delete 1`
  );
});

// /list
bot.onText(/\/list/, (msg) => {
  const userId = msg.from?.id;
  const images = imageStorage.get(userId) || [];
  console.log('📋 /list from user:', userId, '- images:', images.length);

  if (images.length === 0) {
    bot.sendMessage(msg.chat.id,
      '📋 ያስቀመጡት ቅርዓት የለም!\n\n📸 ቅርዓት ለማስቀምጥ ይላኩ!'
    );
    return;
  }

  let text = '📋 ያስቀመጡት ቅርዓቶች:\n\n';
  images.forEach((img, i) => {
    text += `${i + 1}. ${img.caption}\n`;
    text += `   📅 ${new Date(img.timestamp).toLocaleDateString()}\n\n`;
  });
  text += 'ለማካፈል: /send ቁጥር';

  bot.sendMessage(msg.chat.id, text);
});

// /send
bot.onText(/\/send(?:\s+(\d+))?/, (msg, match) => {
  const userId = msg.from?.id;
  const chatId = msg.chat.id;
  const num = parseInt(match[1]) - 1;

  const images = imageStorage.get(userId) || [];

  if (images.length === 0) {
    bot.sendMessage(chatId, '❌ ያስቀመጡት ቅርዓት የለም!');
    return;
  }

  if (isNaN(num) || num < 0 || num >= images.length) {
    bot.sendMessage(chatId,
      `❌ ትክክለኛ ቁጥር ያስገቡ!\n\nየተገኙ: ${images.length}`
    );
    return;
  }

  pendingForwards.set(userId, { image: images[num], step: 'waiting_id' });

  bot.sendMessage(chatId,
    `📤 ማን ላክ?\n\n` +
    `👤 የተቀባይ የተፅዕን ቁጥር ይላኩ\n` +
    `💡 ወይም @username ይ镧ክ\n\n` +
    `➡️ ለምሳሌ: 123456789`
  );
});

// /delete
bot.onText(/\/delete(?:\s+(\d+))?/, (msg, match) => {
  const userId = msg.from?.id;
  const num = parseInt(match[1]) - 1;

  const images = imageStorage.get(userId) || [];

  if (images.length === 0) {
    bot.sendMessage(msg.chat.id, '❌ ያስቀመጡት ቅርዓት የለም!');
    return;
  }

  if (isNaN(num) || num < 0 || num >= images.length) {
    bot.sendMessage(msg.chat.id, '❌ ትክክለኛ ቁጥር ያስገቡ!');
    return;
  }

  images.splice(num, 1);
  bot.sendMessage(msg.chat.id, '✅ ቅርዓቱ ጠፍቷል!');
});

// Handle ALL messages (photos + text replies)
bot.on('message', (msg) => {
  const userId = msg.from?.id;
  const chatId = msg.chat.id;

  // Skip if it's a command (already handled by onText)
  if (msg.text && msg.text.startsWith('/')) return;

  // 1) Handle photos
  if (msg.photo && msg.photo.length > 0) {
    console.log('📸 Photo received from user:', userId);
    const photo = msg.photo[msg.photo.length - 1];
    const caption = msg.caption || 'Enkutatash Greeting 🌸';
    console.log('📸 file_id:', photo.file_id);

    if (!imageStorage.has(userId)) {
      imageStorage.set(userId, []);
    }

    const images = imageStorage.get(userId);
    const entry = {
      fileId: photo.file_id,
      caption: caption,
      timestamp: new Date().toISOString(),
      index: images.length + 1
    };
    images.push(entry);

    console.log('✅ Image saved! Total for user:', images.length);

    bot.sendMessage(chatId,
      `✅ ቅርዓቱ ተቀምጧል!\n\n` +
      `📋 ቁጥር: ${entry.index}\n` +
      `💬 መልዕክት: ${caption}\n\n` +
      `ለማካፈል: /send ${entry.index}`
    );
    return;
  }

  // 2) Handle pending forward reply
  const pending = pendingForwards.get(userId);
  if (pending && pending.step === 'waiting_id' && msg.text && !msg.text.startsWith('/')) {
    const target = msg.text.replace('@', '').trim();

    if (!target.match(/^\d+$/)) {
      bot.sendMessage(chatId, '❌ ትክክለኛ የተፅዕን ቁጥር ያስገቡ!');
      return;
    }

    bot.sendPhoto(parseInt(target), pending.image.fileId, {
      caption: `🌸 ${pending.image.caption}\n\nFrom: Enkutatash Drawer 🇪🇹`
    }).then(() => {
      bot.sendMessage(chatId, '✅ ቅርዓቱ ተላክፏል! 🎉');
      pendingForwards.delete(userId);
    }).catch((err) => {
      console.error('Send error:', err);
      bot.sendMessage(chatId,
        `❌ መላክ አልተቻለም!\n\n` +
        `💡 ተቀባይ Bot ላይ /start እንዲያደርግ ያስገብጉ!\n` +
        `❌ ${err.message || err}`
      );
    });
    return;
  }
});

// API for Mini App
app.post('/api/send-image', async (req, res) => {
  try {
    const { imageData, caption, recipientId } = req.body;

    const buffer = Buffer.from(
      imageData.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    if (recipientId) {
      await bot.sendPhoto(parseInt(recipientId), buffer, {
        caption: `🌸 ${caption || 'Enkutatash Greeting'}\n\nFrom: Enkutatash Drawer 🇪🇹`
      });
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'No recipient' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', bot: 'Enkutatash Bot 🌸' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🌸 Enkutatash Bot running on port ${PORT}`);
  console.log('🤖 Bot polling started!');
});
