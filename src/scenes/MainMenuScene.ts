import Phaser from 'phaser'
import { GameState } from '../game/GameState'
import { BuildingType } from '../game/Building'
import { CAMPAIGN_LEVELS } from '../game/Campaign'
import { soundManager, SoundType } from '../game/SoundManager'
import { CHARACTER_CONFIGS } from '../game/Character'

export default class MainMenuScene extends Phaser.Scene {
  private gameState!: GameState
  private levelSelectionOverlay?: Phaser.GameObjects.Container
  private isLevelSelectionOpen: boolean = false
  private titleLetters: Phaser.GameObjects.Text[] = []
  private currentPattern: number = 0

  constructor() {
    super('MainMenuScene')
  }

  shutdown() {
    // Stop all tweens to prevent errors when scene changes
    this.tweens.killAll()
  }

  create() {
    this.gameState = GameState.getInstance()

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Add scrolling star field
    this.createStarField()

    // Title - split into individual letters for animation
    const titleText = 'ROGUECRAFT'
    const letterSpacing = 38 // Approximate width per letter
    const totalWidth = titleText.length * letterSpacing
    const startX = this.cameras.main.centerX - totalWidth / 2

    for (let i = 0; i < titleText.length; i++) {
      const letter = this.add.text(
        startX + i * letterSpacing,
        100,
        titleText[i],
        {
          fontFamily: 'Courier New',
          fontSize: '56px',
          color: '#00ffff',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5)

      this.titleLetters.push(letter)
    }

    // Start the animated color patterns
    this.startTitleAnimation()

    // Display credits - moved left to make room for $ button
    const creditsText = this.add.text(
      this.cameras.main.width - 60,
      25,
      `${this.gameState.getCredits()} ¤`,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffdd00',
      }
    ).setOrigin(1, 0.5)
    creditsText.setName('creditsDisplay')

    // $ button to add 1000 credits (debug/cheat button) - positioned top right corner
    const creditButton = this.add.text(
      this.cameras.main.width - 20,
      25,
      '$',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffdd00',
        fontStyle: 'bold',
      }
    ).setOrigin(1, 0.5).setInteractive({ useHandCursor: true })

    creditButton.on('pointerover', () => {
      creditButton.setColor('#ffff00')
      creditButton.setScale(1.2)
    })

    creditButton.on('pointerout', () => {
      creditButton.setColor('#ffdd00')
      creditButton.setScale(1)
    })

    creditButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.gameState.addCredits(1000)
      creditsText.setText(`${this.gameState.getCredits()} ¤`)
      // Flash effect
      this.tweens.add({
        targets: creditsText,
        scale: 1.3,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Ensure text is correct after animation
          creditsText.setText(`${this.gameState.getCredits()} ¤`)

          // Update affordability indicators
          const upgradeDot = this.children.getByName('upgradeDot') as Phaser.GameObjects.Arc
          if (upgradeDot) {
            upgradeDot.setVisible(this.hasAffordableUpgrades())
          }

          const hangarDot = this.children.getByName('hangarDot') as Phaser.GameObjects.Arc
          if (hangarDot) {
            hangarDot.setVisible(this.hasAffordableShips())
          }
        }
      })
    })


    // Display currently selected ship
    const selectedCharType = this.gameState.getSelectedCharacter()
    const selectedCharConfig = CHARACTER_CONFIGS[selectedCharType]

    const shipDisplayY = 250
    const shipLabel = this.add.text(
      this.cameras.main.centerX,
      shipDisplayY - 45,
      'SELECTED SHIP',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#888888',
      }
    ).setOrigin(0.5)

    const shipSymbol = this.add.text(
      this.cameras.main.centerX - 100,
      shipDisplayY + 10,
      selectedCharConfig.symbol,
      {
        fontFamily: 'Courier New',
        fontSize: '96px',  // 100% bigger than 48px
        color: selectedCharConfig.color,
      }
    ).setOrigin(0.5)

    const shipName = this.add.text(
      this.cameras.main.centerX + 20,
      shipDisplayY + 10,
      selectedCharConfig.name,
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0, 0.5)

    // Menu buttons
    const buttonWidth = 400
    const buttonHeight = 80
    const buttonSpacing = 20
    const startY = 425  // Moved up 25 pixels

    // Campaign Button (1st position)
    const campaignButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const campaignIcon = this.add.text(
      this.cameras.main.centerX - 150,
      startY,
      '►',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#00ff00',
      }
    ).setOrigin(0.5)

    const campaignText = this.add.text(
      this.cameras.main.centerX + 20,
      startY,
      'CAMPAIGN',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ff00',
        align: 'center',
      }
    ).setOrigin(0.5)

    campaignButton.on('pointerover', () => {
      campaignButton.setFillStyle(0x3a3a6a)
    })

    campaignButton.on('pointerout', () => {
      campaignButton.setFillStyle(0x2a2a4a)
    })

    campaignButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)

      // If only 1 level is unlocked, skip level selection and start directly
      const unlockedLevels = this.gameState.getUnlockedLevels()
      if (unlockedLevels === 1) {
        // Fade out before transitioning
        this.cameras.main.fadeOut(200, 0, 0, 0)
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('LoadingScene', { levelIndex: 0 })
        })
      } else {
        this.showLevelSelection()
      }
    })

    // Co-op Button (2nd position - moved up from 5th)
    const coopButtonY = startY + (buttonHeight + buttonSpacing)

    const coopButton = this.add.rectangle(
      this.cameras.main.centerX,
      coopButtonY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const coopIcon = this.add.text(
      this.cameras.main.centerX - 150,
      coopButtonY,
      '👥',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#ff00ff',
      }
    ).setOrigin(0.5)

    const coopButtonText = this.add.text(
      this.cameras.main.centerX + 20,
      coopButtonY,
      'CO-OP',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ff00ff',
        align: 'center',
      }
    ).setOrigin(0.5)

    coopButton.on('pointerover', () => {
      coopButton.setFillStyle(0x3a3a6a)
    })

    coopButton.on('pointerout', () => {
      coopButton.setFillStyle(0x2a2a4a)
    })

    coopButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      // Show floating "Coming Soon" text
      const comingSoonText = this.add.text(
        this.cameras.main.centerX,
        coopButtonY,
        'Synchronous Co-op Coming Soon!',
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: '#ffff00',
          fontStyle: 'bold',
        }
      ).setOrigin(0.5).setDepth(1000)

      // Animate it floating up and fading out
      this.tweens.add({
        targets: comingSoonText,
        y: coopButtonY - 100,
        alpha: 0,
        duration: 2000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          comingSoonText.destroy()
        }
      })
    })

    // Build Button (3rd position - moved down from 2nd)
    const buildButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + (buttonHeight + buttonSpacing) * 2,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const buildIcon = this.add.text(
      this.cameras.main.centerX - 150,
      startY + (buttonHeight + buttonSpacing) * 2,
      '⚙',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#ffaa00',
      }
    ).setOrigin(0.5)

    const buildText = this.add.text(
      this.cameras.main.centerX + 20,
      startY + (buttonHeight + buttonSpacing) * 2,
      'UPGRADES',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffaa00',
        align: 'center',
      }
    ).setOrigin(0.5)

    buildButton.on('pointerover', () => {
      buildButton.setFillStyle(0x3a3a6a)
    })

    buildButton.on('pointerout', () => {
      buildButton.setFillStyle(0x2a2a4a)
    })

    buildButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.scene.start('BuildingMenuScene')
    })

    // Red dot indicator for affordableupgrades
    const buildButtonY = startY + (buttonHeight + buttonSpacing) * 2
    const upgradeDot = this.add.circle(
      this.cameras.main.centerX + buttonWidth / 2 - 10,
      buildButtonY - buttonHeight / 2 + 10,
      6,
      0xff0000
    ).setVisible(this.hasAffordableUpgrades())
    upgradeDot.setName('upgradeDot')

    // Hangar Button (4th position - moved down from 3rd)
    const hangarButton = this.add.rectangle(
      this.cameras.main.centerX,
      startY + (buttonHeight + buttonSpacing) * 3,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const hangarIcon = this.add.text(
      this.cameras.main.centerX - 150,
      startY + (buttonHeight + buttonSpacing) * 3,
      '◈',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#00ffff',
      }
    ).setOrigin(0.5)

    const hangarText = this.add.text(
      this.cameras.main.centerX + 20,
      startY + (buttonHeight + buttonSpacing) * 3,
      'HANGAR',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#00ffff',
        align: 'center',
      }
    ).setOrigin(0.5)

    hangarButton.on('pointerover', () => {
      hangarButton.setFillStyle(0x3a3a6a)
    })

    hangarButton.on('pointerout', () => {
      hangarButton.setFillStyle(0x2a2a4a)
    })

    hangarButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.scene.start('HangarScene')
    })

    // Red dot indicator for affordable ships
    const hangarButtonY = startY + (buttonHeight + buttonSpacing) * 3
    const hangarDot = this.add.circle(
      this.cameras.main.centerX + buttonWidth / 2 - 10,
      hangarButtonY - buttonHeight / 2 + 10,
      6,
      0xff0000
    ).setVisible(this.hasAffordableShips())
    hangarDot.setName('hangarDot')

    // Stats Button (5th position - moved down from 4th)
    const statsButtonY = startY + (buttonHeight + buttonSpacing) * 4

    const statsButton = this.add.rectangle(
      this.cameras.main.centerX,
      statsButtonY,
      buttonWidth,
      buttonHeight,
      0x2a2a4a
    ).setInteractive({ useHandCursor: true })

    const statsIcon = this.add.text(
      this.cameras.main.centerX - 150,
      statsButtonY,
      'ℹ',
      {
        fontFamily: 'Courier New',
        fontSize: '48px',
        color: '#ffffff',
      }
    ).setOrigin(0.5)

    const statsButtonText = this.add.text(
      this.cameras.main.centerX + 20,
      statsButtonY,
      'INFORMATION',
      {
        fontFamily: 'Courier New',
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
      }
    ).setOrigin(0.5)

    statsButton.on('pointerover', () => {
      statsButton.setFillStyle(0x3a3a6a)
    })

    statsButton.on('pointerout', () => {
      statsButton.setFillStyle(0x2a2a4a)
    })

    statsButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.scene.start('StatsScene')
    })

    // Stats display at bottom
    const statsDisplayText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 80,
      `Total Runs: ${this.gameState.getTotalRuns()} | Best Score: ${this.gameState.getBestScore()} | Total Kills: ${this.gameState.getTotalKills()}`,
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#888888',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Version
    this.add.text(
      10,
      this.cameras.main.height - 10,
      'v0.1.0',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#555555',
      }
    ).setOrigin(0, 1)

    // Reset button (bottom right)
    const resetButton = this.add.text(
      this.cameras.main.width - 10,
      this.cameras.main.height - 10,
      'Reset Save',
      {
        fontFamily: 'Courier New',
        fontSize: '12px',
        color: '#ff6666',
      }
    ).setOrigin(1, 1).setInteractive({ useHandCursor: true })

    resetButton.on('pointerover', () => {
      resetButton.setColor('#ff0000')
    })

    resetButton.on('pointerout', () => {
      resetButton.setColor('#ff6666')
    })

    resetButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
        console.log('Resetting game save...')
        // Clear localStorage first
        localStorage.removeItem('roguecraft_gamestate')
        localStorage.removeItem('roguecraft_highscore')
        // Reset the singleton instance so it creates a fresh one on reload
        GameState.resetInstance()
        // Reload the page to start fresh with tutorial
        window.location.reload()
      }
    })
  }

  private createStarField() {
    // Create multiple layers of stars for parallax effect
    const starLayers = [
      { count: 50, speed: 20, size: 1, brightness: 0.3 },
      { count: 30, speed: 40, size: 2, brightness: 0.6 },
      { count: 20, speed: 60, size: 3, brightness: 1 },
    ]

    starLayers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width)
        // Start at random Y position to spread out stars evenly
        const y = Phaser.Math.Between(-this.cameras.main.height, this.cameras.main.height)

        const alpha = layer.brightness
        const star = this.add.circle(x, y, layer.size, 0xffffff, alpha)

        // Calculate how far this star needs to travel
        const distanceToBottom = this.cameras.main.height + 10 - y
        const baseDuration = (distanceToBottom / layer.speed) * 1000

        // Animate star scrolling downward
        this.tweens.add({
          targets: star,
          y: this.cameras.main.height + 10,
          duration: baseDuration,
          repeat: -1,
          onRepeat: () => {
            // Reset to top with new random X position
            star.x = Phaser.Math.Between(0, this.cameras.main.width)
            star.y = -10

            // Recalculate duration for consistent speed
            const newDistance = this.cameras.main.height + 20
            const newDuration = (newDistance / layer.speed) * 1000

            // Update the tween duration for next loop
            const tween = this.tweens.getTweensOf(star)[0]
            if (tween) {
              tween.duration = newDuration
            }
          }
        })
      }
    })
  }

  private showLevelSelection() {
    if (this.isLevelSelectionOpen) return
    this.isLevelSelectionOpen = true

    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    // Create overlay container
    this.levelSelectionOverlay = this.add.container(0, 0)

    // Semi-transparent background
    const bgOverlay = this.add.rectangle(
      0, 0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.85
    ).setOrigin(0, 0).setInteractive()

    // Prevent clicks from passing through
    bgOverlay.on('pointerdown', () => {
      this.closeLevelSelection()
    })

    // Level selection panel
    const panelWidth = 700
    const panelHeight = 600
    const panel = this.add.rectangle(
      centerX, centerY,
      panelWidth, panelHeight,
      0x1a1a2e
    ).setStrokeStyle(2, 0x00ffff)

    // Title
    const title = this.add.text(
      centerX, centerY - panelHeight / 2 + 40,
      'SELECT MISSION',
      {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: '#00ffff',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    // Close button
    const closeButton = this.add.text(
      centerX + panelWidth / 2 - 40,
      centerY - panelHeight / 2 + 40,
      'X',
      {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#ff6666',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setInteractive({ useHandCursor: true })

    closeButton.on('pointerover', () => {
      closeButton.setColor('#ff0000')
      closeButton.setScale(1.2)
    })

    closeButton.on('pointerout', () => {
      closeButton.setColor('#ff6666')
      closeButton.setScale(1)
    })

    closeButton.on('pointerdown', () => {
      soundManager.play(SoundType.BUTTON_CLICK)
      this.closeLevelSelection()
    })

    // Add all elements to container
    this.levelSelectionOverlay.add([bgOverlay, panel, title, closeButton])

    // Create level list
    const unlockedLevels = this.gameState.getUnlockedLevels()
    const levelStartY = centerY - panelHeight / 2 + 100
    const levelHeight = 45
    const levelSpacing = 2

    CAMPAIGN_LEVELS.forEach((level, index) => {
      const yPos = levelStartY + (levelHeight + levelSpacing) * index
      const isUnlocked = this.gameState.isLevelUnlocked(index)

      // Level container
      const levelBg = this.add.rectangle(
        centerX, yPos,
        panelWidth - 60, levelHeight,
        isUnlocked ? 0x2a2a4a : 0x1a1a2a
      )

      if (isUnlocked) {
        levelBg.setInteractive({ useHandCursor: true })

        levelBg.on('pointerover', () => {
          levelBg.setFillStyle(0x3a3a6a)
        })

        levelBg.on('pointerout', () => {
          levelBg.setFillStyle(0x2a2a4a)
        })

        levelBg.on('pointerdown', () => {
          soundManager.play(SoundType.BUTTON_CLICK)
          this.closeLevelSelection()

          // Fade out before transitioning
          this.cameras.main.fadeOut(200, 0, 0, 0)
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('LoadingScene', { levelIndex: index })
          })
        })
      }

      // Level number and name
      const levelName = this.add.text(
        centerX - (panelWidth - 60) / 2 + 15,
        yPos,
        `${index + 1}. ${level.name}`,
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: isUnlocked ? '#00ff00' : '#666666',
          fontStyle: 'bold',
        }
      ).setOrigin(0, 0.5)

      // Difficulty indicator
      const difficultyText = this.add.text(
        centerX + (panelWidth - 60) / 2 - 15,
        yPos - 8,
        isUnlocked ? `Difficulty: ${level.difficulty.toFixed(1)}x` : '🔒',
        {
          fontFamily: 'Courier New',
          fontSize: '13px',
          color: isUnlocked ? '#ffaa00' : '#666666',
        }
      ).setOrigin(1, 0.5)

      // High score display (below level name on the right)
      const highScore = this.gameState.getLevelHighScore(index)
      const highScoreText = this.add.text(
        centerX + (panelWidth - 60) / 2 - 15,
        yPos + 8,
        isUnlocked && highScore > 0 ? `High Score: ${highScore}` : (isUnlocked ? 'No score yet' : ''),
        {
          fontFamily: 'Courier New',
          fontSize: '13px',
          color: highScore > 0 ? '#ffff00' : '#666666',
        }
      ).setOrigin(1, 0.5)

      this.levelSelectionOverlay!.add([levelBg, levelName, difficultyText, highScoreText])
    })

    // Set depth to be on top
    this.levelSelectionOverlay.setDepth(1000)
  }

  private closeLevelSelection() {
    if (this.levelSelectionOverlay) {
      this.levelSelectionOverlay.destroy()
      this.levelSelectionOverlay = undefined
      this.isLevelSelectionOpen = false
    }
  }

  private startTitleAnimation() {
    // Color palettes for different patterns
    const rainbowColors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0088ff', '#8800ff', '#ff00ff']
    const cyberpunkColors = ['#00ffff', '#ff00ff', '#ffff00', '#00ff00']
    const fireColors = ['#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffff00']
    const iceColors = ['#00ffff', '#aaffff', '#ffffff', '#88ddff']

    // Pattern 1: Rainbow wave that sweeps through letters
    const rainbowWave = () => {
      if (!this.titleLetters || !this.scene.isActive()) return
      this.titleLetters.forEach((letter, i) => {
        if (!letter || !letter.active) return
        this.tweens.add({
          targets: letter,
          delay: i * 80,
          duration: 300,
          onStart: () => {
            const colorIndex = (i + this.time.now / 200) % rainbowColors.length
            letter.setColor(rainbowColors[Math.floor(colorIndex)])
          },
        })
      })
    }

    // Pattern 2: Beat pulse - all letters flash together
    const beatPulse = () => {
      if (!this.titleLetters || !this.scene.isActive()) return
      const color = Phaser.Utils.Array.GetRandom(cyberpunkColors)
      this.titleLetters.forEach((letter) => {
        if (!letter || !letter.active) return
        this.tweens.add({
          targets: letter,
          scale: 1.2,
          duration: 150,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onStart: () => {
            letter.setColor(color)
          },
          onComplete: () => {
            letter.setColor('#00ffff')
          }
        })
      })
    }

    // Pattern 3: Random sparkle - individual letters flash
    const randomSparkle = () => {
      if (!this.titleLetters || !this.scene.isActive()) return
      const randomIndex = Phaser.Math.Between(0, this.titleLetters.length - 1)
      const letter = this.titleLetters[randomIndex]
      if (!letter || !letter.active) return
      const sparkleColor = Phaser.Utils.Array.GetRandom(['#ffffff', '#ffff00', '#00ffff', '#ff00ff'])

      this.tweens.add({
        targets: letter,
        scale: 1.4,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut',
        onStart: () => {
          letter.setColor(sparkleColor)
        },
        onComplete: () => {
          letter.setColor('#00ffff')
        }
      })
    }

    // Pattern 4: Fire wave - warm colors sweep through
    const fireWave = () => {
      if (!this.titleLetters || !this.scene.isActive()) return
      this.titleLetters.forEach((letter, i) => {
        if (!letter || !letter.active) return
        this.tweens.add({
          targets: letter,
          delay: i * 60,
          duration: 250,
          y: letter.y - 8,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onStart: () => {
            letter.setColor(fireColors[i % fireColors.length])
          },
          onComplete: () => {
            letter.setColor('#00ffff')
          }
        })
      })
    }

    // Pattern 5: Ice wave - cool colors sweep through
    const iceWave = () => {
      if (!this.titleLetters || !this.scene.isActive()) return
      this.titleLetters.forEach((letter, i) => {
        if (!letter || !letter.active) return
        this.tweens.add({
          targets: letter,
          delay: i * 60,
          duration: 250,
          onStart: () => {
            letter.setColor(iceColors[i % iceColors.length])
          },
          onComplete: () => {
            letter.setColor('#00ffff')
          }
        })
      })
    }

    // Pattern 6: Alternating flash - even/odd letters
    const alternatingFlash = () => {
      if (!this.titleLetters || !this.scene.isActive()) return
      const color1 = Phaser.Utils.Array.GetRandom(cyberpunkColors)
      const color2 = Phaser.Utils.Array.GetRandom(cyberpunkColors)

      this.titleLetters.forEach((letter, i) => {
        if (!letter || !letter.active) return
        this.tweens.add({
          targets: letter,
          scale: 1.15,
          duration: 180,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onStart: () => {
            letter.setColor(i % 2 === 0 ? color1 : color2)
          },
          onComplete: () => {
            letter.setColor('#00ffff')
          }
        })
      })
    }

    // Pattern 7: Glitch effect - rapid color changes
    const glitchEffect = () => {
      if (!this.titleLetters || !this.scene.isActive()) return
      const randomCount = Phaser.Math.Between(2, 4)
      for (let g = 0; g < randomCount; g++) {
        const randomIndex = Phaser.Math.Between(0, this.titleLetters.length - 1)
        const letter = this.titleLetters[randomIndex]
        if (!letter || !letter.active) continue

        this.tweens.add({
          targets: letter,
          x: letter.x + Phaser.Math.Between(-3, 3),
          duration: 50,
          yoyo: true,
          repeat: 2,
          onStart: () => {
            letter.setColor(Phaser.Utils.Array.GetRandom(['#ff00ff', '#00ff00', '#ffff00']))
          },
          onComplete: () => {
            letter.setColor('#00ffff')
          }
        })
      }
    }

    const patterns = [
      rainbowWave,
      beatPulse,
      randomSparkle,
      fireWave,
      iceWave,
      alternatingFlash,
      glitchEffect
    ]

    // Timer-based pattern changes (feels like music beats)
    // Vary the timing to feel more natural
    const scheduleNextPattern = () => {
      // Safety check: stop scheduling if scene is no longer active
      if (!this.scene.isActive() || !this.titleLetters) return

      const delays = [800, 1000, 1200, 1600, 2000] // Different beat timings
      const nextDelay = Phaser.Utils.Array.GetRandom(delays)

      this.time.delayedCall(nextDelay, () => {
        // Safety check before executing pattern
        if (!this.scene.isActive() || !this.titleLetters) return

        // Pick a random pattern
        const patternIndex = Phaser.Math.Between(0, patterns.length - 1)
        patterns[patternIndex]()

        // Occasionally do a double-hit (feels like beat emphasis)
        if (Math.random() < 0.25) {
          this.time.delayedCall(150, () => {
            if (!this.scene.isActive() || !this.titleLetters) return
            const quickPattern = Phaser.Utils.Array.GetRandom([beatPulse, randomSparkle, glitchEffect])
            quickPattern()
          })
        }

        scheduleNextPattern()
      })
    }

    // Start the pattern cycle
    scheduleNextPattern()

    // Also add continuous subtle rainbow cycling in the background
    this.time.addEvent({
      delay: 100,
      callback: () => {
        // Safety check: only update if scene is active and letters exist
        if (!this.scene.isActive() || !this.titleLetters) return

        this.titleLetters.forEach((letter, i) => {
          // Safety check: ensure letter still exists and is active
          if (!letter || !letter.active) return

          const hue = (this.time.now / 20 + i * 30) % 360
          const colorObj = Phaser.Display.Color.HSVToRGB(hue / 360, 0.3, 1) as { r: number; g: number; b: number }
          const hexColor = Phaser.Display.Color.RGBToString(
            Math.floor(colorObj.r),
            Math.floor(colorObj.g),
            Math.floor(colorObj.b)
          )
          // Only apply if letter isn't currently being animated
          if (letter.scale === 1) {
            letter.setColor(hexColor)
          }
        })
      },
      loop: true
    })
  }

  private hasAffordableUpgrades(): boolean {
    const credits = this.gameState.getCredits()
    const buildings = this.gameState.getAllBuildings()

    // Check if any building can be upgraded and is affordable
    return buildings.some(building => {
      if (!building.canUpgrade()) return false
      const cost = building.getUpgradeCost()
      return cost > 0 && credits >= cost
    })
  }

  private hasAffordableShips(): boolean {
    const credits = this.gameState.getCredits()
    const SHIP_COST = 250
    const unlockedCharacters = this.gameState.getUnlockedCharacters()

    // Count total characters available
    const totalCharacters = Object.keys(CHARACTER_CONFIGS).length

    // If not all characters are unlocked and player can afford one, return true
    return unlockedCharacters.length < totalCharacters && credits >= SHIP_COST
  }
}
