const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');

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

// Temporary image storage (imageId -> { buffer, caption, senderName, expires })
const pendingImages = new Map();

// Auto-cleanup old images (10 min expiry)
setInterval(() => {
  const now = Date.now();
  for (const [id, img] of pendingImages) {
    if (now > img.expires) {
      pendingImages.delete(id);
    }
  }
}, 60000);

console.log('🌸 Enkutatash Bot starting...');

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from?.first_name || 'User';
  bot.sendMessage(chatId,
    `🌸 እንኳን በደመር ደህና መጡ!\n\n` +
    `ሰላም ${name}!\n\n` +
    `ከእንኳን በደመር ማዕበል ቅርዓት ይ relinquish!\n\n` +
    `🎨 ከ Mini App ቅርዓት ይuemarı\n` +
    `📤 /send ቁጥር - ቅርዓት ላክ\n` +
    `📋 /list - ያስቀመጡትን ይመልከቱ\n` +
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
    `   /send ቁጥር\n\n` +
    `3️⃣ ያስቀመጡትን ለማየት:\n` +
    `   /list`
  );
});

// /list
bot.onText(/\/list/, (msg) => {
  const userId = msg.from?.id;
  const userImages = [];
  for (const [id, img] of pendingImages) {
    if (img.senderId === userId) {
      userImages.push({ id, ...img });
    }
  }
  console.log('📋 /list from user:', userId, '- images:', userImages.length);

  if (userImages.length === 0) {
    bot.sendMessage(msg.chat.id,
      '📋 ያስቀመጡት ቅርዓት የለም!\n\n🎨 ከ Mini App ቅርዓት ይuemarı!'
    );
    return;
  }

  let text = '📋 ያስቀመጡት ቅርዓቶች:\n\n';
  userImages.forEach((img, i) => {
    text += `${i + 1}. ${img.caption}\n`;
    text += `   📅 ${new Date(img.created).toLocaleDateString()}\n\n`;
  });

  bot.sendMessage(msg.chat.id, text);
});

// /send - manual send via bot
bot.onText(/\/send(?:\s+(\S+))?/, (msg, match) => {
  const userId = msg.from?.id;
  const chatId = msg.chat.id;
  const imageId = match[1];

  if (!imageId) {
    bot.sendMessage(chatId, '❌ /send <image_id>\n\n📋 /list የስስ ቁጥር ይመልከቱ');
    return;
  }

  const img = pendingImages.get(imageId);
  if (!img || img.senderId !== userId) {
    bot.sendMessage(chatId, '❌ ቅርዓቱ አልተገኘም!');
    return;
  }

  // Store pending forward
  if (!global.pendingForwards) global.pendingForwards = new Map();
  global.pendingForwards.set(userId, { imageId, step: 'waiting_id' });

  bot.sendMessage(chatId,
    `📤 ማን ላክ?\n\n` +
    `👤 የተቀባይ የተፅዕን ቁጥር ይላኩ\n\n` +
    `➡️ ለምሳሌ: 123456789`
  );
});

// Handle ALL messages (photos + text replies)
bot.on('message', (msg) => {
  const userId = msg.from?.id;
  const chatId = msg.chat.id;

  // Skip commands
  if (msg.text && msg.text.startsWith('/')) return;

  // Handle photos sent directly to bot
  if (msg.photo && msg.photo.length > 0) {
    console.log('📸 Photo received from user:', userId);
    const photo = msg.photo[msg.photo.length - 1];
    const caption = msg.caption || 'Enkutatash Greeting 🌸';

    const imageId = crypto.randomBytes(6).toString('hex');
    pendingImages.set(imageId, {
      fileId: photo.file_id,
      caption: caption,
      senderId: userId,
      senderName: msg.from?.first_name || 'User',
      created: new Date().toISOString(),
      expires: Date.now() + 600000
    });

    bot.sendMessage(chatId,
      `✅ ቅርዓቱ ተቀምጧል!\n\n` +
      `🔑 ID: ${imageId}\n` +
      `💬 መልዕክት: ${caption}\n\n` +
      `ለማካፈል: /send ${imageId}`
    );
    return;
  }

  // Handle pending forward reply
  if (!global.pendingForwards) global.pendingForwards = new Map();
  const pending = global.pendingForwards.get(userId);
  if (pending && pending.step === 'waiting_id' && msg.text && !msg.text.startsWith('/')) {
    const target = msg.text.replace('@', '').trim();

    if (!target.match(/^\d+$/)) {
      bot.sendMessage(chatId, '❌ ትክክለኛ የተፅዕን ቁጥር ያስገቡ!');
      return;
    }

    const img = pendingImages.get(pending.imageId);
    if (!img) {
      bot.sendMessage(chatId, '❌ ቅርዓቱ ጊዜው ዘልቷል!');
      global.pendingForwards.delete(userId);
      return;
    }

    bot.sendPhoto(parseInt(target), img.fileId, {
      caption: `🌸 ${img.caption}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`
    }).then(() => {
      bot.sendMessage(chatId, '✅ ቅርዓቱ ተላክፏል! 🎉');
      global.pendingForwards.delete(userId);
    }).catch((err) => {
      console.error('Send error:', err.message);
      bot.sendMessage(chatId,
        `❌ መላክ አልተቻለም!\n\n` +
        `💡 ተቀባይ Bot ላይ /start እንዲያደርግ ያስገብጉ!\n` +
        `❌ ${err.message}`
      );
    });
    return;
  }
});

// ===== INLINE QUERY HANDLER =====
// When user picks a contact via switchInlineQuery, bot sends the image
bot.on('inline_query', async (query) => {
  const userId = query.from?.id;
  const queryText = query.query.trim();

  console.log(`📤 Inline query from ${userId}: "${queryText}"`);

  if (!queryText) {
    // Show user's stored images as inline results
    const userImages = [];
    for (const [id, img] of pendingImages) {
      if (img.senderId === userId) {
        userImages.push({ id, ...img });
      }
    }

    if (userImages.length === 0) {
      return bot.answerInlineQuery(query.id, [{
        type: 'article',
        id: 'none',
        title: '🎨 ቅርዓት ያድርጉ',
        description: 'ቀጥል በ Mini App ቅርዓት ይuemarı',
        input_message_content: {
          message_text: '🌸 እንኳን በደመር ደህና መጡ! ቅርዓት ይuemarı!'
        }
      }]);
    }

    const results = userImages.map((img) => ({
      type: 'photo',
      id: img.id,
      photo_url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`,
      thumb_url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`,
      caption: `🌸 ${img.caption}\n\nFrom: Enkutatash Drawer 🇪🇹`,
      parse_mode: 'HTML'
    }));

    return bot.answerInlineQuery(query.id, results, { cache_time: 0 });
  }

  // If query contains an imageId, send that image
  const img = pendingImages.get(queryText);
  if (img) {
    const results = [{
      type: 'photo',
      id: queryText,
      photo_url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`,
      thumb_url: `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`,
      caption: `🌸 ${img.caption}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`
    }];
    return bot.answerInlineQuery(query.id, results, { cache_time: 0 });
  }

  bot.answerInlineQuery(query.id, [{
    type: 'article',
    id: 'notfound',
    title: '❌ ቅርዓቱ አልተገኘም',
    description: 'ለተሳካ ሁኔታ ከ Mini App ይuemarı',
    input_message_content: {
      message_text: '❌ ቅርዓቱ አልተገኘም'
    }
  }]);
});

// ===== API for Mini App =====

// Upload image and get an ID for inline sharing
app.post('/api/upload-image', (req, res) => {
  try {
    const { imageData, caption, senderName, senderId } = req.body;

    if (!imageData) {
      return res.json({ success: false, message: 'No image data' });
    }

    const buffer = Buffer.from(
      imageData.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const imageId = crypto.randomBytes(6).toString('hex');

    pendingImages.set(imageId, {
      buffer: buffer,
      caption: caption || 'Enkutatash Greeting 🌸',
      senderName: senderName || 'Enkutatash Drawer',
      senderId: senderId,
      created: new Date().toISOString(),
      expires: Date.now() + 600000 // 10 minutes
    });

    console.log(`📤 Image uploaded: ${imageId} from ${senderName}`);

    res.json({ success: true, imageId: imageId });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Direct send via API (for bot commands)
app.post('/api/send-image', async (req, res) => {
  try {
    const { imageData, caption, recipientId, senderName } = req.body;

    if (!imageData || !recipientId) {
      return res.json({ success: false, message: 'Missing image or recipient' });
    }

    const buffer = Buffer.from(
      imageData.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const targetId = parseInt(recipientId);
    if (isNaN(targetId)) {
      return res.json({ success: false, message: 'Invalid recipient ID' });
    }

    console.log(`📤 API: Sending image to ${targetId} from ${senderName || 'unknown'}`);

    await bot.sendPhoto(targetId, buffer, {
      caption: `🌸 ${caption || 'Enkutatash Greeting'}\n\nFrom: ${senderName || 'Enkutatash Drawer'} 🇪🇹`
    });

    console.log('✅ Image sent successfully!');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ API Error:', error.message);
    res.json({ success: false, message: error.message || 'Failed to send' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', bot: 'Enkutatash Bot 🌸', pendingImages: pendingImages.size });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🌸 Enkutatash Bot running on port ${PORT}`);
  console.log('🤖 Bot polling started!');
});
