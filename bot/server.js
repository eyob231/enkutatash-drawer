const express = require('express');
const cors = require('cors');
const { Bot } = require('node-telegram-bot-api');

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
const bot = new Bot(BOT_TOKEN);

// In-memory storage
const imageStorage = new Map();
const pendingForwards = new Map();

console.log('🌸 Enkutatash Bot starting...');

// Single message handler for everything
bot.on('message', async (ctx) => {
  try {
    const userId = ctx.from?.id;
    const chatId = ctx.chatId;
    const msg = ctx.message;

    if (!userId || !chatId) {
      console.log('⚠️ No userId or chatId');
      return;
    }

    console.log(`📩 Message from user ${userId} in chat ${chatId}`);

    // 1) Handle photos
    const photos = msg?.photo;
    if (photos && photos.length > 0) {
      console.log('📸 Photo detected! Count:', photos.length);
      const photo = photos[photos.length - 1]; // largest size
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

      await bot.api.sendMessage(chatId,
        `✅ ቅርዓቱ ተቀምጧል!\n\n` +
        `📋 ቁጥር: ${entry.index}\n` +
        `💬 መልዕክት: ${caption}\n\n` +
        `ለማካፈል: /send ${entry.index}`
      );
      return;
    }

    // 2) Handle commands
    const text = msg?.text || '';

    if (text.startsWith('/')) {
      const parts = text.split(' ');
      const cmd = parts[0].split('@')[0]; // remove @botname

      if (cmd === '/start') {
        const name = ctx.from?.first_name || 'User';
        await bot.api.sendMessage(chatId,
          `🌸 እንኳን በደመር ደህና መጡ!\n\n` +
          `ሰላም ${name}!\n\n` +
          `የእንኳን በደመር ማዕበል መሳፈሪያ ነው!\n\n` +
          `📥 ቅርዓት ለማስቀምጥ: ቅርዓቱን ይላኩ!\n` +
          `📤 /send ቁጥር - ቅርዓት ላክ\n` +
          `📋 /list - ያስቀመጡትን ይመልከቱ\n` +
          `🗑️ /delete ቁጥር - ቅርዓት ያጥፉ\n` +
          `❓ /help - እርዳታ`
        );
        return;
      }

      if (cmd === '/help') {
        await bot.api.sendMessage(chatId,
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
        return;
      }

      if (cmd === '/list') {
        const images = imageStorage.get(userId) || [];
        console.log('📋 /list from user:', userId, '- images:', images.length);

        if (images.length === 0) {
          await bot.api.sendMessage(chatId,
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

        await bot.api.sendMessage(chatId, text);
        return;
      }

      if (cmd === '/send') {
        const images = imageStorage.get(userId) || [];
        const num = parseInt(parts[1]) - 1;

        if (images.length === 0) {
          await bot.api.sendMessage(chatId, '❌ ያስቀመጡት ቅርዓት የለም!');
          return;
        }

        if (isNaN(num) || num < 0 || num >= images.length) {
          await bot.api.sendMessage(chatId,
            `❌ ትክክለኛ ቁጥር ያስገቡ!\n\nየተገኙ: ${images.length}`
          );
          return;
        }

        pendingForwards.set(userId, { image: images[num], step: 'waiting_id' });

        await bot.api.sendMessage(chatId,
          `📤 ማን ላክ?\n\n` +
          `👤 የተቀባይ የተፅዕን ቁጥር ይላኩ\n` +
          `💡 ወይም @username ይ镧ክ\n\n` +
          `➡️ ለምሳሌ: 123456789`
        );
        return;
      }

      if (cmd === '/delete') {
        const images = imageStorage.get(userId) || [];
        const num = parseInt(parts[1]) - 1;

        if (images.length === 0) {
          await bot.api.sendMessage(chatId, '❌ ያስቀመጡት ቅርዓት የለም!');
          return;
        }

        if (isNaN(num) || num < 0 || num >= images.length) {
          await bot.api.sendMessage(chatId, '❌ ትክክለኛ ቁጥር ያስገቡ!');
          return;
        }

        images.splice(num, 1);
        await bot.api.sendMessage(chatId, '✅ ቅርዓቱ ጠፍቷል!');
        return;
      }
    }

    // 3) Handle pending forward reply (text without /)
    const pending = pendingForwards.get(userId);
    if (pending && pending.step === 'waiting_id' && text && !text.startsWith('/')) {
      const target = text.replace('@', '').trim();

      if (!target.match(/^\d+$/)) {
        await bot.api.sendMessage(chatId,
          '❌ ትክክለኛ የተፅዕን ቁጥር ያስገቡ!'
        );
        return;
      }

      try {
        await bot.api.sendPhoto(parseInt(target), pending.image.fileId, {
          caption: `🌸 ${pending.image.caption}\n\nFrom: Enkutatash Drawer 🇪🇹`
        });

        await bot.api.sendMessage(chatId, '✅ ቅርዓቱ ተላክፏል! 🎉');
        pendingForwards.delete(userId);
      } catch (err) {
        console.error('Send error:', err);
        await bot.api.sendMessage(chatId,
          `❌ መላክ አልተቻለም!\n\n` +
          `💡 ተቀባይ Bot ላይ /start እንዲያደርግ ያስገብጉ!\n` +
          `❌ ${err.message || err}`
        );
      }
      return;
    }
  } catch (err) {
    console.error('❌ Message handler error:', err);
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
      const { InputFile } = require('node-telegram-bot-api');
      await bot.api.sendPhoto(parseInt(recipientId), new InputFile(buffer, 'enkutatash.png'), {
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
  res.json({ status: 'ok', bot: 'Enkutatash Bot 🌸', images: imageStorage.size });
});

const PORT = process.env.PORT || 3001;

// Start polling
bot.startPolling().then(() => {
  console.log('🤖 Bot polling started successfully!');
}).catch((err) => {
  console.error('❌ Bot polling error:', err.message);
  if (err.errorCode === 409) {
    console.log('⚠️ Another bot instance is running. Stopping.');
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`🌸 Enkutatash Bot running on port ${PORT}`);
});
