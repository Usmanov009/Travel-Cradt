import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";

export function useTelegramWebApp() {
  useEffect(() => {
    if (WebApp) {
      WebApp.ready();
      WebApp.expand();

      const themeParams = WebApp.themeParams;
      if (themeParams.bg_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-bg-color",
          themeParams.bg_color
        );
      }
      if (themeParams.text_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-text-color",
          themeParams.text_color
        );
      }
      if (themeParams.hint_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-hint-color",
          themeParams.hint_color
        );
      }
      if (themeParams.link_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-link-color",
          themeParams.link_color
        );
      }
      if (themeParams.button_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-button-color",
          themeParams.button_color
        );
      }
      if (themeParams.button_text_color) {
        document.documentElement.style.setProperty(
          "--tg-theme-button-text-color",
          themeParams.button_text_color
        );
      }
    }
  }, []);

  return {
    webApp: WebApp,
    user: WebApp.initDataUnsafe?.user,
    platform: WebApp.platform,
    colorScheme: WebApp.colorScheme,
    isExpanded: WebApp.isExpanded,
    showBackButton: () => WebApp.BackButton.show(),
    hideBackButton: () => WebApp.BackButton.hide(),
    showMainButton: (text: string, onClick: () => void) => {
      WebApp.MainButton.setText(text);
      WebApp.MainButton.onClick(onClick);
      WebApp.MainButton.show();
    },
    hideMainButton: () => WebApp.MainButton.hide(),
    close: () => WebApp.close(),
    sendData: (data: string) => WebApp.sendData(data),
  };
}
