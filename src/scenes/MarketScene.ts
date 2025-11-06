import Phaser from 'phaser'
import { GameState, TutorialStep } from '../game/GameState'
import { CharacterType, CHARACTER_CONFIGS } from '../game/Character'

const GACHA_COST = 250
const DUPLICATE_SCRAP_CREDITS = 100

export default class MarketScene extends Phaser.Scene {
  private gameState!: GameState
  private gemsText!: Phaser.GameObjects.Text
  private creditsText!: Phaser.GameObjects.Text
  private rollButton!: Phaser.GameObjects.Rectangle
  private rollButtonText!: Phaser.GameObjects.Text
  private isRolling: boolean = false

  constructor() {
    super('MarketScene')
  }

  create() {
    this.gameState = GameState.getInstance()
    this.isRolling = false

    // Tutorial: Set step to ROLL_GACHA when entering Market during tutorial
    if (this.gameState.getTutorialStep() === TutorialStep.OPEN_MARKET) {
      this.gameState.setTutorialStep(TutorialStep.ROLL_GACHA)
    }

    // Add background
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0a0a1e)
      .setOrigin(0, 0)

    // Title
    const title = this.add.text(
      this.cameras.main.centerX,
      30,
      'MARKET',
      {
        fontFamily: 'Courier New',
        fontSize: '40px',
        color: '#ffaa00',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    // Subtitle
    const subtitle = this.add.text(
      this.cameras.main.centerX,
      75,
      'Roll for New Ships',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#aaaaaa',
      }
    ).setOrigin(0.5)

    // Currency display
    this.gemsText = this.add.text(
      this.cameras.main.centerX,
      120,
      `◆ Gems: ${this.gameState.getGems()}`,
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#00ffff',
      }
    ).setOrigin(0.5)

    this.creditsText = this.add.text(
      this.cameras.main.centerX,
      145,
      `¤ Credits: ${this.gameState.getCredits()}`,
      {
        fontFamily: 'Courier New',
        fontSize: '16px',
        color: '#ffdd00',
      }
    ).setOrigin(0.5)

    // Back button
    const backButton = this.add.text(
      20,
      20,
      '← Back',
      {
        fontFamily: 'Courier New',
        fontSize: '20px',
        color: '#00ffff',
      }
    ).setInteractive({ useHandCursor: true })

    backButton.on('pointerover', () => {
      backButton.setColor('#00ff00')
    })

    backButton.on('pointerout', () => {
      backButton.setColor('#00ffff')
    })

    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene')
    })

    // Gacha display area
    const gachaArea = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      460,
      300,
      0x1a1a3a
    ).setStrokeStyle(2, 0x4a4a6a)

    const gachaText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      'Roll for a Random Ship!\n\nCost: 250 Gems ◆',
      {
        fontFamily: 'Courier New',
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
      }
    ).setOrigin(0.5)

    // Roll button
    const canAfford = this.gameState.getGems() >= GACHA_COST
    this.rollButton = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 60,
      300,
      80,
      canAfford ? 0x4a6a4a : 0x4a4a4a
    ).setInteractive({ useHandCursor: canAfford })

    this.rollButtonText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 60,
      'ROLL',
      {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: canAfford ? '#00ff00' : '#888888',
        fontStyle: 'bold',
      }
    ).setOrigin(0.5)

    if (canAfford) {
      this.rollButton.on('pointerover', () => {
        if (!this.isRolling) {
          this.rollButton.setFillStyle(0x5a7a5a)
        }
      })

      this.rollButton.on('pointerout', () => {
        if (!this.isRolling) {
          this.rollButton.setFillStyle(0x4a6a4a)
        }
      })

      this.rollButton.on('pointerdown', () => {
        if (!this.isRolling) {
          this.performRoll()
        }
      })
    }

    // Info text
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.height - 80,
      'Duplicates are converted to Credits',
      {
        fontFamily: 'Courier New',
        fontSize: '14px',
        color: '#888888',
      }
    ).setOrigin(0.5)
  }

  private performRoll() {
    // Check if can afford
    if (this.gameState.getGems() < GACHA_COST) {
      return
    }

    this.isRolling = true

    // Spend gems
    this.gameState.spendGems(GACHA_COST)
    this.updateCurrencyDisplay()

    // Disable button
    this.rollButton.setFillStyle(0x3a3a3a)
    this.rollButtonText.setColor('#555555')

    // Roll animation
    this.createRollAnimation()
  }

  private createRollAnimation() {
    // Create spinning card effect
    const cardBg = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      200,
      280,
      0x2a2a4a
    ).setDepth(100)

    const cardText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      '?',
      {
        fontFamily: 'Courier New',
        fontSize: '120px',
        color: '#ffaa00',
      }
    ).setOrigin(0.5).setDepth(101)

    // Spin animation
    this.tweens.add({
      targets: [cardBg, cardText],
      scaleX: 0,
      duration: 100,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        // Determine result
        const result = this.rollGacha()

        // Show result
        this.showResult(result, cardBg, cardText)
      }
    })
  }

  private rollGacha(): { character: CharacterType; isDuplicate: boolean } {
    // Get all character types except ACE (ACE is starter)
    const allCharacters = Object.values(CharacterType).filter(type => type !== CharacterType.ACE)
    const unlockedCharacters = this.gameState.getUnlockedCharacters()

    console.log('Rolling gacha... Currently unlocked:', unlockedCharacters)

    // Random character
    const randomCharacter = Phaser.Utils.Array.GetRandom(allCharacters)
    console.log('Rolled:', randomCharacter)

    // Check if duplicate
    const isDuplicate = unlockedCharacters.includes(randomCharacter)

    if (!isDuplicate) {
      console.log('New character! Unlocking:', randomCharacter)
      this.gameState.unlockCharacter(randomCharacter)
      const updatedUnlocked = this.gameState.getUnlockedCharacters()
      console.log('After unlock, characters:', updatedUnlocked)
    } else {
      console.log('Duplicate! Giving scrap credits:', DUPLICATE_SCRAP_CREDITS)
      // Give scrap credits
      this.gameState.addCredits(DUPLICATE_SCRAP_CREDITS)
    }

    return { character: randomCharacter, isDuplicate }
  }

  private showResult(
    result: { character: CharacterType; isDuplicate: boolean },
    cardBg: Phaser.GameObjects.Rectangle,
    cardText: Phaser.GameObjects.Text
  ) {
    const config = CHARACTER_CONFIGS[result.character]

    // Update card to show character
    cardText.setText(config.symbol)
    cardText.setColor(config.color)
    cardText.setFontSize('100px')

    // Create result overlay
    this.time.delayedCall(800, () => {
      const overlay = this.add.rectangle(
        0, 0,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0.8
      ).setOrigin(0, 0).setDepth(200)

      const resultTitle = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 150,
        result.isDuplicate ? 'DUPLICATE!' : 'NEW SHIP!',
        {
          fontFamily: 'Courier New',
          fontSize: '48px',
          color: result.isDuplicate ? '#ffaa00' : '#00ff00',
        }
      ).setOrigin(0.5).setDepth(201)

      const characterSymbol = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 60,
        config.symbol,
        {
          fontFamily: 'Courier New',
          fontSize: '80px',
          color: config.color,
        }
      ).setOrigin(0.5).setDepth(201)

      const characterName = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 30,
        config.name,
        {
          fontFamily: 'Courier New',
          fontSize: '32px',
          color: '#ffffff',
        }
      ).setOrigin(0.5).setDepth(201)

      let rewardText: string
      if (result.isDuplicate) {
        rewardText = `Converted to ${DUPLICATE_SCRAP_CREDITS} Credits ¤`
      } else {
        rewardText = `Unlocked in Hangar!`
      }

      const reward = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 70,
        rewardText,
        {
          fontFamily: 'Courier New',
          fontSize: '18px',
          color: result.isDuplicate ? '#ffdd00' : '#00ffaa',
        }
      ).setOrigin(0.5).setDepth(201)

      // Continue button
      const continueButton = this.add.rectangle(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 140,
        250,
        60,
        0x2a4a2a
      ).setDepth(201).setInteractive({ useHandCursor: true })

      const continueButtonText = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 140,
        'CONTINUE',
        {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#00ff00',
        }
      ).setOrigin(0.5).setDepth(202)

      continueButton.on('pointerover', () => {
        continueButton.setFillStyle(0x3a5a3a)
      })

      continueButton.on('pointerout', () => {
        continueButton.setFillStyle(0x2a4a2a)
      })

      continueButton.on('pointerdown', () => {
        // Tutorial: Complete tutorial after first roll
        if (this.gameState.getTutorialStep() === TutorialStep.ROLL_GACHA) {
          this.gameState.setTutorialStep(TutorialStep.COMPLETE)
        }

        // Clean up
        overlay.destroy()
        resultTitle.destroy()
        characterSymbol.destroy()
        characterName.destroy()
        reward.destroy()
        continueButton.destroy()
        continueButtonText.destroy()
        cardBg.destroy()
        cardText.destroy()

        // Reset scene
        this.scene.restart()
      })
    })
  }

  private updateCurrencyDisplay() {
    this.gemsText.setText(`◆ Gems: ${this.gameState.getGems()}`)
    this.creditsText.setText(`¤ Credits: ${this.gameState.getCredits()}`)
  }
}
