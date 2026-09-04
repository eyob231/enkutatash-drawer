const express = require('express');
const cors = require('cors');
const { Bot, InputFile } = require('node-telegram-bot-api');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const BOT_TOKEN = process.env.BOT_TOKEN || '8275075918:AAEbnYcOiCVSAV-COFaOKMI4_qQ7j8yi2GM';
const bot = new Bot(BOT_TOKEN);

// In-memory storage
const imageStorage = new Map();
const pendingForwards = new Map();

console.log('🌸 Enkutatash Bot starting...');

// /start command
bot.command('start', async (ctx) => {
  const name = ctx.from?.first_name || 'User';
  await ctx.reply(
    `🌸 እንኳን በደመር ደህና መጡ!\n\n` +
    `ሰላም ${name}!\n\n` +
    `የ እንኳን በደመር ማዕበል መሳIEW ነው!\n\n` +
    `📥 ቅርዓት ለማስቀምጥ: ቅርዓቱን ይላኩ!\n` +
    `📤 /send ቁጥር - ቅርዓት ላክ\n` +
    `📋 /list - ያስቀመጡትን ይመልከቱ\n` +
    `🗑️ /delete ቁጥር - ቅርዓት ያጥፉ\n` +
    `❓ /help - እርዳታ`
  );
});

// /help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    `📖 የBot መ飾ዕከት:\n\n` +
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

// /list command
bot.command('list', async (ctx) => {
  const userId = ctx.from?.id;
  const images = imageStorage.get(userId) || [];
  
  if (images.length === 0) {
    return ctx.reply('📋 ያስቀመጡት ቅርዓት የለም!');
  }
  
  let text = '📋 ያስቀመጡት ቅርዓቶች:\n\n';
  images.forEach((img, i) => {
    text += `${i + 1}. ${img.caption}\n`;
    text += `   📅 ${new Date(img.timestamp).toLocaleDateString()}\n\n`;
  });
  text += 'ለማካፈል: /send ቁጥር';
  
  await ctx.reply(text);
});

// /send command
bot.command('send', async (ctx) => {
  const userId = ctx.from?.id;
  const text = ctx.message?.text || '';
  const parts = text.split(' ');
  const num = parseInt(parts[1]) - 1;
  
  const images = imageStorage.get(userId) || [];
  
  if (images.length === 0) {
    return ctx.reply('❌ ያስቀመጡት ቅርዓት የለም!');
  }
  
  if (isNaN(num) || num < 0 || num >= images.length) {
    return ctx.reply(`❌ ትክክለኛ ቁጥር ያስገቡ!\n\nየተገኙ: ${images.length}`);
  }
  
  pendingForwards.set(userId, { image: images[num], step: 'waiting_id' });
  
  await ctx.reply(
    `📤 ማን ላክ?\n\n` +
    `👤 የተቀባይ የተፅዕን ቁጥር ይላኩ\n` +
    `💡 ወይም @username ይWritten\n\n` +
    `➡️ ለምሳሌ: 123456789`
  );
});

// /delete command
bot.command('delete', async (ctx) => {
  const userId = ctx.from?.id;
  const text = ctx.message?.text || '';
  const parts = text.split(' ');
  const num = parseInt(parts[1]) - 1;
  
  const images = imageStorage.get(userId) || [];
  
  if (images.length === 0) {
    return ctx.reply('❌ ያስቀመጡት ቅርዓት የለም!');
  }
  
  if (isNaN(num) || num < 0 || num >= images.length) {
    return ctx.reply('❌ ትክክለኛ ቁጥር ያስገቡ!');
  }
  
  images.splice(num, 1);
  await ctx.reply('✅ ቅርዓቱ ጠፍቷል!');
});

// Handle photos
bot.on('photo', async (ctx) => {
  const userId = ctx.from?.id;
  const chatId = ctx.chat?.id;
  const photos = ctx.message?.photo;
  
  if (!photos || photos.length === 0) return;
  
  const photo = photos[photos.length - 1];
  const caption = ctx.message?.caption || 'Enkutatash Greeting 🌸';
  
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
  
  await ctx.reply(
    `✅ ቅርዓቱ ተቀምጧል!\n\n` +
    `📋 ቁጥር: ${entry.index}\n` +
    `💬 መልዕክት: ${caption}\n\n` +
    `ለማካፈል: /send ${entry.index}`
  );
});

// Handle text (for forwarding)
bot.on('text', async (ctx) => {
  const userId = ctx.from?.id;
  const text = ctx.message?.text || '';
  
  const pending = pendingForwards.get(userId);
  
  if (pending && pending.step === 'waiting_id' && !text.startsWith('/')) {
    const target = text.replace('@', '');
    
    if (!target.match(/^\d+$/)) {
      return ctx.reply('❌ ትክክለኛ የተፅዕን ቁጥር ያስገቡ!');
    }
    
    try {
      await bot.api.sendPhoto(parseInt(target), pending.image.fileId, {
        caption: `🌸 ${pending.image.caption}\n\nFrom: Enkutatash Drawer 🇪🇹`
      });
      
      await ctx.reply('✅ ቅርዓቱ ተላክፏል! 🎉');
      pendingForwards.delete(userId);
    } catch (err) {
      console.error('Send error:', err);
      await ctx.reply(
        '❌ መላክ አልተቻለም!\n\n' +
        '💡 ተቀባዩ Bot ላይ /start እንዲ没错 አድርጉ!'
      );
    }
  }
});

// API for Mini App
app.post('/api/send-image', async (req, res) => {
  try {
    const { imageData, caption, recipientId } = req.body;
    
    const buffer = Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    
    if (recipientId) {
      await bot.api.sendPhoto(recipientId, buffer, {
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

// Start the bot polling
bot.startPolling();
console.log('🤖 Bot polling started');

app.listen(PORT, () => {
  console.log(`🌸 Enkutatash Bot running on port ${PORT}`);
});
