import Phaser from 'phaser'
import BootScene from '../scenes/BootScene'
import LoadingScene from '../scenes/LoadingScene'
import GameScene from '../scenes/GameScene'
import MainMenuScene from '../scenes/MainMenuScene'
import BuildingMenuScene from '../scenes/BuildingMenuScene'
import HangarScene from '../scenes/HangarScene'
import StatsScene from '../scenes/StatsScene'
import { CoopLobbyScene } from '../scenes/CoopLobbyScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 600,
  height: 980,
  backgroundColor: '#1a1a2e',
  input: {
    gamepad: true,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, LoadingScene, GameScene, MainMenuScene, BuildingMenuScene, HangarScene, StatsScene, CoopLobbyScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Fixed virtual resolution - Phaser will scale to fit any screen
    width: 600,
    height: 980,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
}
