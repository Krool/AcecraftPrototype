import Phaser from 'phaser'
import LoadingScene from '../scenes/LoadingScene'
import GameScene from '../scenes/GameScene'
import MainMenuScene from '../scenes/MainMenuScene'
import BuildingMenuScene from '../scenes/BuildingMenuScene'
import HangarScene from '../scenes/HangarScene'
import StatsScene from '../scenes/StatsScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 540,
  height: 960,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [GameScene, MainMenuScene, BuildingMenuScene, HangarScene, StatsScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
}
