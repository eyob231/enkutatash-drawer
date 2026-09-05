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

// Temporary image storage
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

// ===== BOT COMMANDS =====

bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const payload = match && match[1] ? match[1].trim() : '';

  // Deep link from the Mini App: deliver the card so the kid can forward it
  if (payload.startsWith('send_')) {
    const imageId = payload.slice(5);
    console.log(`📬 /start send_${imageId} from`, msg.from?.id);

    const img = pendingImages.get(imageId);
    if (!img) {
      return bot.sendMessage(chatId,
        '❌ ቅርዓቱ አልተገኘም ወይም ጊዜው አልፏል።\n\n🎨 አዲስ ቅርዓት ለመስራት ወደ Mini App ይመለሱ!'
      );
    }

    const caption = `🌸 ${img.caption || 'እንኳን በደመር ደህና መጡ!'}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`;

    const sendPromise = img.buffer
      ? bot.sendPhoto(chatId, img.buffer, { caption })
      : bot.sendPhoto(chatId, img.fileId, { caption });

    return sendPromise
      .then(() => bot.sendMessage(chatId,
        '🎉 ቅርዓትዎ ተዘጋጅቷል!\n\n' +
        '📤 ለጓደኛዎ ለመላክ:\n' +
        '1️⃣ በምስሉ ላይ ይንኩ\n' +
        '2️⃣ ↗️ አስተላልፍ (Forward) ይንኩ\n' +
        '3️⃣ ጓደኛዎን ይምረጡ! 🌸'
      ))
      .catch((e) => {
        console.error('❌ Failed to deliver card:', e.message);
        bot.sendMessage(chatId, '❌ ቅርዓቱን መላክ አልተቻለም።');
      });
  }

  const name = msg.from?.first_name || 'User';
  bot.sendMessage(chatId,
    `🌸 እንኳን በደመር ደህና መጡ!\n\n` +
    `ሰላም ${name}!\n\n` +
    `ከእንኳን በደመር ማዕበል ቅርዓት ይuemaru!\n\n` +
    `🎨 ከ Mini App ቅርዓት ይuemaru\n` +
    `❓ /help - እርዳታ`
  );
  console.log('🚀 /start from', msg.from?.id);
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📖 የBot መመሪያ:\n\n` +
    `新形势下 ቅርዓት ለማስቀምጥ:\n` +
    `   ቅርዓቱን ይላኩ!\n\n` +
    `新形势下 ቅርዓት ለማካፈል:\n` +
    `   @testnewnew3_bot\n\n` +
    `新形势下 ያስቀመጡትን ለማየት:\n` +
    `   /list`
  );
});

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
      '📋 ያስቀመጡት ቅርዓት የለም!\n\n🎨 ከ Mini App ቅርዓት ይuemaru!'
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

// Handle photos sent directly to bot
bot.on('message', (msg) => {
  const userId = msg.from?.id;
  const chatId = msg.chat.id;

  if (msg.text && msg.text.startsWith('/')) return;

  // Handle photos
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
      `ለማካፈል ይ试 press the Mini App button! 🎁`
    );
    return;
  }
});

// ===== INLINE QUERY HANDLER =====
// When user picks a contact via switchInlineQuery, bot shows the image
bot.on('inline_query', async (query) => {
  const userId = query.from?.id;
  const queryText = query.query.trim();

  console.log(`📤 Inline query from ${userId}: "${queryText}"`);

  if (!queryText) {
    // Show user's stored images
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
        description: 'ቀጥል በ Mini App ቅርዓት ይuemaru',
        input_message_content: {
          message_text: '🌸 እንኳን በደመር ደህና መጡ!'
        }
      }], { cache_time: 0 });
    }

    const results = userImages.map((img) => {
      // Use file_id if available (from Telegram), otherwise use our API URL
      const photoUrl = img.fileId
        ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`
        : `${getBaseUrl()}/api/image/${img.id}`;
      const thumbUrl = img.fileId
        ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`
        : `${getBaseUrl()}/api/image/${img.id}`;

      return {
        type: 'photo',
        id: img.id,
        photo_url: photoUrl,
        thumb_url: thumbUrl,
        caption: `🌸 ${img.caption}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`
      };
    });

    return bot.answerInlineQuery(query.id, results, { cache_time: 0 });
  }

  // If query contains an imageId, show that specific image
  const img = pendingImages.get(queryText);
  if (img) {
    const photoUrl = img.fileId
      ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`
      : `${getBaseUrl()}/api/image/${img.id}`;

    return bot.answerInlineQuery(query.id, [{
      type: 'photo',
      id: queryText,
      photo_url: photoUrl,
      thumb_url: photoUrl,
      caption: `🌸 ${img.caption}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`
    }], { cache_time: 0 });
  }

  bot.answerInlineQuery(query.id, [{
    type: 'article',
    id: 'notfound',
    title: '❌ ቅርዓቱ አልተገኘም',
    description: 'ለተሳካ ሁኔታ ከ Mini App ይuemaru',
    input_message_content: {
      message_text: '❌ ቅርዓቱ አልተገኘም'
    }
  }], { cache_time: 0 });
});

// ===== API FOR MINI APP =====

// Serve stored images by ID (for inline query results)
app.get('/api/image/:id', (req, res) => {
  const img = pendingImages.get(req.params.id);
  if (!img || !img.buffer) {
    return res.status(404).json({ error: 'Image not found or expired' });
  }

  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'public, max-age=600');
  res.send(img.buffer);
});

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
      expires: Date.now() + 600000
    });

    console.log(`📤 Image uploaded: ${imageId} from ${senderName}`);

    res.json({ success: true, imageId: imageId });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save the card as a prepared inline message so the Mini App can open
// Telegram's native share dialog (contact picker) via WebApp.shareMessage.
app.post('/api/prepare-message', async (req, res) => {
  try {
    const { imageId, userId } = req.body;

    if (!imageId || !userId) {
      return res.json({ success: false, message: 'Missing imageId or userId' });
    }

    const img = pendingImages.get(imageId);
    if (!img) {
      return res.json({ success: false, message: 'Image not found or expired' });
    }

    const photoUrl = img.fileId
      ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${img.fileId}`
      : `${getBaseUrl()}/api/image/${img.id}`;

    const result = {
      type: 'photo',
      id: imageId,
      photo_url: photoUrl,
      thumb_url: photoUrl,
      caption: `🌸 ${img.caption || 'እንኳን በደመር ደህና መጡ!'}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`
    };

    // savePreparedInlineMessage is not in this library version, call the API directly.
    // Use a urlencoded form (like every other method in this library) — the response
    // then arrives as a plain string the library can parse.
    const prepared = await bot._request('savePreparedInlineMessage', {
      form: {
        user_id: userId,
        result: JSON.stringify(result),
        allow_user_chats: true,
        allow_bot_chats: true,
        allow_group_chats: true,
        allow_channel_chats: true
      }
    });

    console.log(`✅ Prepared message for user ${userId}:`, prepared.id);
    res.json({ success: true, messageId: prepared.id });
  } catch (error) {
    console.error('❌ prepare-message error:', error.message);
    res.json({ success: false, message: error.message || 'Failed to prepare message' });
  }
});

// Send image to a user by username
app.post('/api/send-by-username', async (req, res) => {
  try {
    const { imageId, username } = req.body;

    if (!imageId || !username) {
      return res.json({ success: false, message: 'Missing imageId or username' });
    }

    const img = pendingImages.get(imageId);
    if (!img) {
      return res.json({ success: false, message: 'Image not found or expired' });
    }

    const cleanUsername = username.replace('@', '').trim();
    const target = `@${cleanUsername}`;

    console.log(`📤 Sending image ${imageId} to ${target}`);

    // Try to send using buffer (for uploaded base64 images) or file_id
    if (img.buffer) {
      await bot.sendPhoto(target, img.buffer, {
        caption: `🌸 ${img.caption}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`
      });
    } else if (img.fileId) {
      await bot.sendPhoto(target, img.fileId, {
        caption: `🌸 ${img.caption}\n\nFrom: ${img.senderName || 'Enkutatash Drawer'} 🇪🇹`
      });
    }

    console.log(`✅ Image sent to ${target}`);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Send by username error:', error.message);
    res.json({ success: false, message: error.message || 'Failed to send' });
  }
});

// Send image to a user by ID
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

function getBaseUrl() {
  return process.env.BASE_URL || `https://enkutatash-drawer.onrender.com`;
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🌸 Enkutatash Bot running on port ${PORT}`);
  console.log('🤖 Bot polling started!');
});
