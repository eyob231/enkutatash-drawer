import { useEffect, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegram() {
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
    } catch (e) {
      // Not in Telegram
    }
  }, []);

  const close = useCallback(() => {
    try { WebApp.close(); } catch (e) {}
  }, []);

  const toggleMainButton = useCallback((text: string, onClick: () => void, _isVisible = true) => {
    try {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(onClick);
      WebApp.MainButton.show();
    } catch (e) {}
  }, []);

  const hideMainButton = useCallback(() => {
    try {
      WebApp.MainButton.hide();
      WebApp.MainButton.offClick(() => {});
    } catch (e) {}
  }, []);

  const toggleBackButton = useCallback((isVisible: boolean, onClick?: () => void) => {
    try {
      if (isVisible && onClick) {
        WebApp.BackButton.onClick(onClick);
        WebApp.BackButton.show();
      } else {
        WebApp.BackButton.hide();
        WebApp.BackButton.offClick(() => {});
      }
    } catch (e) {}
  }, []);

  const showAlert = useCallback((message: string) => {
    try { WebApp.showAlert(message); } catch (e) { alert(message); }
  }, []);

  const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    try {
      WebApp.showConfirm(message, callback);
    } catch (e) {
      const confirmed = window.confirm(message);
      if (callback) callback(confirmed);
    }
  }, []);

  // Open Telegram's inline mode
  const openInlineMode = useCallback(() => {
    try {
      WebApp.switchInlineQuery('', ['users']);
    } catch (e) {
      console.log('Failed to open inline mode:', e);
    }
  }, []);

  // Open a Telegram chat with pre-filled message
  const openTelegramChat = useCallback((username: string, text?: string) => {
    try {
      const url = `https://t.me/${username}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
      WebApp.openTelegramLink(url);
    } catch (e) {
      window.open(`https://t.me/${username}`, '_blank');
    }
  }, []);

  const user = WebApp.initDataUnsafe?.user;

  return {
    WebApp,
    user,
    close,
    toggleMainButton,
    hideMainButton,
    toggleBackButton,
    showAlert,
    showConfirm,
    openInlineMode,
    openTelegramChat,
    colorScheme: WebApp.colorScheme,
    themeParams: WebApp.themeParams,
  };
}
