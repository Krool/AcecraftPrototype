import Phaser from 'phaser'
import { networkSystem, MessageType } from '../systems/NetworkSystem'
import { GameState } from '../game/GameState'
import { CharacterType, CHARACTER_CONFIGS } from '../game/Character'

enum LobbyState {
  MENU = 'menu',
  HOSTING = 'hosting',
  JOINING = 'joining',
  WAITING = 'waiting'
}

export class CoopLobbyScene extends Phaser.Scene {
  private lobbyState: LobbyState = LobbyState.MENU
  private uiElements: Phaser.GameObjects.GameObject[] = []
  private inviteCode: string = ''
  private inviteInput: string = ''
  private playerName: string = 'Player'
  private selectedCharacter: CharacterType = CharacterType.VULCAN
  private inputText: Phaser.GameObjects.Text | null = null
  private statusText: Phaser.GameObjects.Text | null = null
  private playerListText: Phaser.GameObjects.Text | null = null
  private startButton: Phaser.GameObjects.Text | null = null

  constructor() {
    super('CoopLobbyScene')
  }

  create() {
    // Get selected character from game state
    this.selectedCharacter = GameState.getInstance().getSelectedCharacter()
    this.playerName = `Player ${Math.floor(Math.random() * 1000)}`

    // Setup network event handlers
    this.setupNetworkHandlers()

    // Show initial menu
    this.showMainMenu()

    // Keyboard input for invite code
    this.input.keyboard?.on('keydown', this.handleKeyInput, this)
  }

  private setupNetworkHandlers() {
    networkSystem.on(MessageType.PLAYER_JOINED, (data) => {
      console.log('[Lobby] Player joined:', data)
      this.updatePlayerList()
      this.updateStartButton()
    })

    networkSystem.on(MessageType.PLAYER_LEFT, (data) => {
      console.log('[Lobby] Player left:', data)
      this.updatePlayerList()
      this.updateStartButton()
    })

    networkSystem.on(MessageType.GAME_START, () => {
      console.log('[Lobby] Game starting!')
      this.startCoopGame()
    })

    networkSystem.on('disconnected', () => {
      console.log('[Lobby] Disconnected')
      this.showError('Disconnected from host')
      this.lobbyState = LobbyState.MENU
      this.showMainMenu()
    })
  }

  private clearUI() {
    this.uiElements.forEach(el => el.destroy())
    this.uiElements = []
    this.inputText = null
    this.statusText = null
    this.playerListText = null
    this.startButton = null
  }

  private showMainMenu() {
    this.clearUI()
    this.lobbyState = LobbyState.MENU

    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    // Title
    const title = this.add.text(centerX, 80, 'CO-OP MODE', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.uiElements.push(title)

    // Character display
    const charConfig = CHARACTER_CONFIGS[this.selectedCharacter]
    const charText = this.add.text(centerX, 150, `Character: ${charConfig.name}`, {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.uiElements.push(charText)

    // Host button
    const hostBtn = this.add.text(centerX, centerY - 50, '[ HOST GAME ]', {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#00ff00'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    hostBtn.on('pointerover', () => hostBtn.setColor('#88ff88'))
    hostBtn.on('pointerout', () => hostBtn.setColor('#00ff00'))
    hostBtn.on('pointerdown', () => this.hostGame())
    this.uiElements.push(hostBtn)

    // Join button
    const joinBtn = this.add.text(centerX, centerY + 20, '[ JOIN GAME ]', {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#ffff00'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    joinBtn.on('pointerover', () => joinBtn.setColor('#ffff88'))
    joinBtn.on('pointerout', () => joinBtn.setColor('#ffff00'))
    joinBtn.on('pointerdown', () => this.showJoinScreen())
    this.uiElements.push(joinBtn)

    // Back button
    const backBtn = this.add.text(centerX, centerY + 120, '[ BACK ]', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'))
    backBtn.on('pointerout', () => backBtn.setColor('#888888'))
    backBtn.on('pointerdown', () => {
      this.scene.start('MainMenuScene')
    })
    this.uiElements.push(backBtn)
  }

  private async hostGame() {
    this.clearUI()
    this.lobbyState = LobbyState.HOSTING

    const centerX = this.cameras.main.centerX

    // Status text
    this.statusText = this.add.text(centerX, 100, 'Creating game...', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.uiElements.push(this.statusText)

    try {
      this.inviteCode = await networkSystem.hostGame(this.playerName, this.selectedCharacter)
      this.showHostingScreen()
    } catch (error) {
      console.error('[Lobby] Failed to host:', error)
      this.showError('Failed to create game')
      this.showMainMenu()
    }
  }

  private showHostingScreen() {
    this.clearUI()
    this.lobbyState = LobbyState.WAITING

    const centerX = this.cameras.main.centerX

    // Title
    const title = this.add.text(centerX, 60, 'HOSTING GAME', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.uiElements.push(title)

    // Invite code display
    const codeLabel = this.add.text(centerX, 120, 'Invite Code:', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5)
    this.uiElements.push(codeLabel)

    const codeText = this.add.text(centerX, 160, this.inviteCode, {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.uiElements.push(codeText)

    // Instructions
    const instructionText = this.add.text(centerX, 210, 'Share this code with your partner', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5)
    this.uiElements.push(instructionText)

    // Player list
    const listLabel = this.add.text(centerX, 280, 'Players:', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.uiElements.push(listLabel)

    this.playerListText = this.add.text(centerX, 320, '', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#88ff88',
      align: 'center'
    }).setOrigin(0.5)
    this.uiElements.push(this.playerListText)
    this.updatePlayerList()

    // Start button (disabled until 2 players)
    this.startButton = this.add.text(centerX, 420, '[ START GAME ]', {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#444444'
    }).setOrigin(0.5)
    this.uiElements.push(this.startButton)
    this.updateStartButton()

    // Cancel button
    const cancelBtn = this.add.text(centerX, 480, '[ CANCEL ]', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    cancelBtn.on('pointerover', () => cancelBtn.setColor('#ff8888'))
    cancelBtn.on('pointerout', () => cancelBtn.setColor('#ff6666'))
    cancelBtn.on('pointerdown', () => {
      networkSystem.disconnect()
      this.showMainMenu()
    })
    this.uiElements.push(cancelBtn)
  }

  private showJoinScreen() {
    this.clearUI()
    this.lobbyState = LobbyState.JOINING
    this.inviteInput = ''

    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    // Title
    const title = this.add.text(centerX, 80, 'JOIN GAME', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.uiElements.push(title)

    // Instructions
    const instructionText = this.add.text(centerX, 140, 'Enter invite code:', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.uiElements.push(instructionText)

    // Input display
    this.inputText = this.add.text(centerX, 200, '______', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.uiElements.push(this.inputText)

    // Status
    this.statusText = this.add.text(centerX, 260, 'Type the 6-character code', {
      fontFamily: 'Courier New',
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5)
    this.uiElements.push(this.statusText)

    // Join button
    const joinBtn = this.add.text(centerX, 340, '[ JOIN ]', {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#00ff00'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    joinBtn.on('pointerover', () => joinBtn.setColor('#88ff88'))
    joinBtn.on('pointerout', () => joinBtn.setColor('#00ff00'))
    joinBtn.on('pointerdown', () => this.joinGame())
    this.uiElements.push(joinBtn)

    // Back button
    const backBtn = this.add.text(centerX, 400, '[ BACK ]', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'))
    backBtn.on('pointerout', () => backBtn.setColor('#888888'))
    backBtn.on('pointerdown', () => this.showMainMenu())
    this.uiElements.push(backBtn)
  }

  private async joinGame() {
    if (this.inviteInput.length !== 6) {
      this.showError('Please enter a 6-character code')
      return
    }

    if (this.statusText) {
      this.statusText.setText('Connecting...')
      this.statusText.setColor('#ffff00')
    }

    try {
      await networkSystem.joinGame(this.inviteInput.toUpperCase(), this.playerName, this.selectedCharacter)
      this.showWaitingScreen()
    } catch (error) {
      console.error('[Lobby] Failed to join:', error)
      this.showError('Failed to join game')
    }
  }

  private showWaitingScreen() {
    this.clearUI()
    this.lobbyState = LobbyState.WAITING

    const centerX = this.cameras.main.centerX

    // Title
    const title = this.add.text(centerX, 80, 'CONNECTED', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    this.uiElements.push(title)

    // Status
    this.statusText = this.add.text(centerX, 140, 'Waiting for host to start...', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.uiElements.push(this.statusText)

    // Player list
    const listLabel = this.add.text(centerX, 220, 'Players:', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5)
    this.uiElements.push(listLabel)

    this.playerListText = this.add.text(centerX, 260, '', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#88ff88',
      align: 'center'
    }).setOrigin(0.5)
    this.uiElements.push(this.playerListText)
    this.updatePlayerList()

    // Leave button
    const leaveBtn = this.add.text(centerX, 400, '[ LEAVE ]', {
      fontFamily: 'Courier New',
      fontSize: '20px',
      color: '#ff6666'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })

    leaveBtn.on('pointerover', () => leaveBtn.setColor('#ff8888'))
    leaveBtn.on('pointerout', () => leaveBtn.setColor('#ff6666'))
    leaveBtn.on('pointerdown', () => {
      networkSystem.disconnect()
      this.showMainMenu()
    })
    this.uiElements.push(leaveBtn)
  }

  private updatePlayerList() {
    if (!this.playerListText) return

    const players = Array.from(networkSystem.players.entries())
    const playerLines = players.map(([id, info], index) => {
      const isLocal = id === networkSystem.localPlayerId
      const prefix = isLocal ? '> ' : '  '
      const suffix = id === networkSystem.hostId ? ' (Host)' : ''
      return `${prefix}${info.name}${suffix}`
    })

    this.playerListText.setText(playerLines.join('\n') || 'No players')
  }

  private updateStartButton() {
    if (!this.startButton || !networkSystem.isHost) return

    const canStart = networkSystem.getPlayerCount() >= 2

    if (canStart) {
      this.startButton.setColor('#00ff00')
      this.startButton.setInteractive({ useHandCursor: true })
      this.startButton.on('pointerover', () => this.startButton?.setColor('#88ff88'))
      this.startButton.on('pointerout', () => this.startButton?.setColor('#00ff00'))
      this.startButton.on('pointerdown', () => {
        networkSystem.send(MessageType.GAME_START, {})
        this.startCoopGame()
      })
    } else {
      this.startButton.setColor('#444444')
      this.startButton.removeInteractive()
      this.startButton.removeAllListeners()
    }
  }

  private handleKeyInput(event: KeyboardEvent) {
    if (this.lobbyState !== LobbyState.JOINING) return

    const key = event.key.toUpperCase()

    if (key === 'BACKSPACE') {
      this.inviteInput = this.inviteInput.slice(0, -1)
    } else if (key.length === 1 && /[A-Z0-9]/.test(key) && this.inviteInput.length < 6) {
      this.inviteInput += key
    }

    this.updateInputDisplay()
  }

  private updateInputDisplay() {
    if (!this.inputText) return

    const display = this.inviteInput.padEnd(6, '_')
    this.inputText.setText(display)
  }

  private showError(message: string) {
    if (this.statusText) {
      this.statusText.setText(message)
      this.statusText.setColor('#ff6666')
    }
  }

  private startCoopGame() {
    // Store network info in registry for GameScene to access
    this.registry.set('isCoopMode', true)
    this.registry.set('isHost', networkSystem.isHost)
    this.registry.set('localPlayerId', networkSystem.localPlayerId)
    this.registry.set('players', Array.from(networkSystem.players.entries()))

    // Start the game
    this.scene.start('GameScene')
  }

  shutdown() {
    this.input.keyboard?.off('keydown', this.handleKeyInput, this)
    this.clearUI()
  }
}
