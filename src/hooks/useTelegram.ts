import { useEffect, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';

const isTelegram = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp?.initData;

export function useTelegram() {
  useEffect(() => {
    if (isTelegram) {
      try {
        WebApp.ready();
        WebApp.expand();
      } catch (e) {
        // Not in Telegram environment
      }
    }
  }, []);

  const close = useCallback(() => {
    if (isTelegram) WebApp.close();
  }, []);

  const toggleMainButton = useCallback((text: string, onClick: () => void, _isVisible = true) => {
    if (!isTelegram) return;
    try {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(onClick);
      WebApp.MainButton.show();
    } catch (e) {
      // Not in Telegram
    }
  }, []);

  const hideMainButton = useCallback(() => {
    if (!isTelegram) return;
    try {
      WebApp.MainButton.hide();
      WebApp.MainButton.offClick(() => {});
    } catch (e) {
      // Not in Telegram
    }
  }, []);

  const toggleBackButton = useCallback((isVisible: boolean, onClick?: () => void) => {
    if (!isTelegram) return;
    try {
      if (isVisible && onClick) {
        WebApp.BackButton.onClick(onClick);
        WebApp.BackButton.show();
      } else {
        WebApp.BackButton.hide();
        WebApp.BackButton.offClick(() => {});
      }
    } catch (e) {
      // Not in Telegram
    }
  }, []);

  const showAlert = useCallback((message: string) => {
    if (isTelegram) {
      WebApp.showAlert(message);
    } else {
      alert(message);
    }
  }, []);

  const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    if (isTelegram) {
      WebApp.showConfirm(message, callback);
    } else {
      const confirmed = window.confirm(message);
      if (callback) callback(confirmed);
    }
  }, []);

  const user = isTelegram ? WebApp.initDataUnsafe?.user : null;

  return {
    WebApp,
    user,
    isTelegram,
    close,
    toggleMainButton,
    hideMainButton,
    toggleBackButton,
    showAlert,
    showConfirm,
    colorScheme: isTelegram ? WebApp.colorScheme : 'dark',
    themeParams: isTelegram ? WebApp.themeParams : null,
  };
}
