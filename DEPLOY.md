# 🌸 Enkutatash Drawer - Deployment Guide

## 📱 Telegram Mini App Deployment

### 1. Build for Production

```bash
cd enkutatash-drawer
npm run build
```

This creates a `dist/` folder with optimized static files.

### 2. Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 3. Deploy to Netlify

1. Drag and drop the `dist/` folder to [Netlify](https://app.netlify.com)
2. Or connect your GitHub repo

### 4. Deploy to GitHub Pages

```bash
# Add to package.json
"homepage": "https://yourusername.github.io/enkutatash-drawer"

# Build and deploy
npm run build
npx gh-pages -d dist
```

## 🤖 Telegram Bot Setup

### 1. Create Bot with @BotFather

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Choose a name: `Enkutatash Drawer Bot`
4. Choose a username: `testnewnew3_bot`
5. Save the bot token

### 2. Configure Bot Commands

Send to @BotFather:
```
/setcommands
```

Then paste:
```
start - መነሻ ገጽ
help - እርዳታ
```

### 3. Set Bot Description

Send to @BotFather:
```
/setdescription
```

Then paste:
```
🌸 እንኳን በደመ Cuộc ደህና መጡ! ቅርዓት ይ remin እና ስጦታ ይላኩ።
```

### 4. Set Bot Profile Photo

Send to @BotFather:
```
/setuserpic
```

Upload a flower image.

### 5. Configure Web App

Send to @BotFather:
```
/setmenubutton
```

Then:
1. Select your bot
2. Enter the URL of your deployed app
3. Enter button text: `🌸 ቅርዓት ይ remin`

## 🔧 Environment Variables

Create a `.env` file for production:

```env
# Chapa API (if using backend)
VITE_CHAPA_API_URL=https://api.chapa.co/v1

# TeleBirr (if using deep links)
VITE_TELEBIRR_PHONE=+2519XXXXXXXX

# App URL
VITE_APP_URL=https://enkutatash-drawer.vercel.app
```

## 📱 Telegram Mini App Configuration

### 1. Set Web App URL

Send to @BotFather:
```
/setmenubutton
```

Select your bot and enter your deployed URL.

### 2. Test in Telegram

1. Open your bot in Telegram
2. Click the menu button
3. The Mini App should open

## 🚀 Quick Deploy Commands

```bash
# Build
npm run build

# Test locally
npx serve dist

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
npx netlify-cli deploy --dir=dist --prod
```

## 📋 Checklist

- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] All texts are in Amharic
- [ ] TeleBirr phone input works
- [ ] Gift modal opens centered
- [ ] Close button works at top-right
- [ ] Canvas drawing works on mobile
- [ ] Deploy to hosting platform
- [ ] Configure Telegram bot
- [ ] Test in Telegram

## 🔗 Useful Links

- [Telegram Mini Apps Docs](https://core.telegram.org/bots/webapps)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [TeleBirr API](https://developer.ethiostelebirr.com/)
- [Chapa API](https://developer.chapa.co/)
