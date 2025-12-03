// Google Analytics event tracking utilities for Roguecraft

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

// Roguecraft specific events
export const Analytics = {
  // Track game start
  gameStarted: (characterId: string) => {
    trackEvent("game_start", {
      character: characterId,
    });
  },

  // Track game over
  gameOver: (score: number, wave: number, playTimeSeconds: number) => {
    trackEvent("game_over", {
      score,
      wave_reached: wave,
      play_time_seconds: playTimeSeconds,
    });
  },

  // Track character unlock
  characterUnlocked: (characterId: string) => {
    trackEvent("character_unlocked", {
      character: characterId,
    });
  },

  // Track weapon evolution
  weaponEvolved: (weaponId: string) => {
    trackEvent("weapon_evolved", {
      weapon: weaponId,
    });
  },

  // Track boss defeated
  bossDefeated: (bossId: string, wave: number) => {
    trackEvent("boss_defeated", {
      boss: bossId,
      wave,
    });
  },

  // Track upgrade selected
  upgradeSelected: (upgradeId: string, wave: number) => {
    trackEvent("upgrade_selected", {
      upgrade: upgradeId,
      wave,
    });
  },
};
