import Peer, { DataConnection } from 'peerjs'

export enum MessageType {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Game state
  STATE_SYNC = 'state_sync',

  // Player input
  INPUT = 'input',

  // Game events
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  GAME_START = 'game_start',
  GAME_END = 'game_end',

  // Entity events
  SPAWN_ENEMY = 'spawn_enemy',
  ENEMY_DIED = 'enemy_died',
  SPAWN_PROJECTILE = 'spawn_projectile',
  DAMAGE_DEALT = 'damage_dealt',
  SPAWN_PICKUP = 'spawn_pickup',
  PICKUP_COLLECTED = 'pickup_collected',
  PLAYER_DAMAGED = 'player_damaged',
  PLAYER_DIED = 'player_died',
  WAVE_START = 'wave_start',
  WAVE_COMPLETE = 'wave_complete',
  LEVEL_UP = 'level_up',
  WEAPON_ACQUIRED = 'weapon_acquired',
}

export interface NetworkMessage {
  type: MessageType
  data: any
  senderId: string
  timestamp: number
}

export interface PlayerState {
  x: number
  y: number
  health: number
  maxHealth: number
  score: number
  level: number
  xp: number
  weapons: string[]
  passives: string[]
}

export interface GameState {
  players: Map<string, PlayerState>
  enemies: any[]
  projectiles: any[]
  pickups: any[]
  wave: number
  time: number
}

type EventHandler = (data: any, senderId?: string) => void

export class NetworkSystem {
  private peer: Peer | null = null
  private connections: Map<string, DataConnection> = new Map()
  private eventHandlers: Map<string, EventHandler[]> = new Map()

  // Connection state
  public isConnected: boolean = false
  public isHost: boolean = false
  public localPlayerId: string = ''
  public sessionId: string = ''
  public hostId: string = ''

  // Players
  public players: Map<string, { name: string, character: string, isReady: boolean }> = new Map()

  // Sync settings
  private syncRate: number = 50 // 20Hz
  private lastSyncTime: number = 0

  constructor() {
    this.localPlayerId = this.generateId()
  }

  /**
   * Get PeerJS configuration based on environment
   * - Localhost: Uses default PeerJS cloud server (or local server if running)
   * - Production: Uses default PeerJS cloud server
   */
  private getPeerConfig(): any {
    // Check if we're running locally with a custom PeerJS server
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    // ICE servers for WebRTC connection establishment
    const iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ]

    const config: any = {
      debug: isLocalhost ? 2 : 0, // More verbose logging in dev
      config: {
        iceServers: iceServers
      }
    }

    // Uncomment to use local PeerJS server in development:
    // if (isLocalhost) {
    //   config.host = 'localhost'
    //   config.port = 9000
    //   config.path = '/'
    //   config.secure = false
    // }

    return config
  }

  /**
   * Initialize as host - create a new game session
   */
  async hostGame(playerName: string, character: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate a short invite code
      this.sessionId = this.generateInviteCode()

      // Create peer with session ID as the peer ID
      this.peer = new Peer(this.sessionId, this.getPeerConfig())

      this.peer.on('open', (id) => {
        console.log('[Network] Hosting game with ID:', id)
        this.isHost = true
        this.isConnected = true
        this.hostId = id
        this.localPlayerId = id

        // Add self as player
        this.players.set(id, {
          name: playerName,
          character: character,
          isReady: true
        })

        resolve(this.sessionId)
      })

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn)
      })

      this.peer.on('error', (err) => {
        console.error('[Network] Host error:', err)
        reject(err)
      })
    })
  }

  /**
   * Join an existing game session
   */
  async joinGame(inviteCode: string, playerName: string, character: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sessionId = inviteCode

      // Create peer with random ID
      this.peer = new Peer(undefined, this.getPeerConfig())

      this.peer.on('open', (id) => {
        console.log('[Network] Local peer ID:', id)
        this.localPlayerId = id
        this.hostId = inviteCode

        // Connect to host
        const conn = this.peer!.connect(inviteCode, {
          reliable: true,
          metadata: {
            name: playerName,
            character: character
          }
        })

        conn.on('open', () => {
          console.log('[Network] Connected to host')
          this.isConnected = true
          this.isHost = false
          this.connections.set(inviteCode, conn)

          // Send join message
          this.send(MessageType.PLAYER_JOINED, {
            name: playerName,
            character: character
          })

          resolve()
        })

        conn.on('data', (data) => {
          this.handleMessage(data as NetworkMessage)
        })

        conn.on('close', () => {
          console.log('[Network] Disconnected from host')
          this.emit('disconnected', {})
        })

        conn.on('error', (err) => {
          console.error('[Network] Connection error:', err)
          reject(err)
        })
      })

      this.peer.on('error', (err) => {
        console.error('[Network] Peer error:', err)
        reject(err)
      })
    })
  }

  /**
   * Handle incoming connection (host only)
   */
  private handleIncomingConnection(conn: DataConnection) {
    console.log('[Network] Incoming connection from:', conn.peer)

    conn.on('open', () => {
      this.connections.set(conn.peer, conn)

      const metadata = conn.metadata || {}
      this.players.set(conn.peer, {
        name: metadata.name || 'Player',
        character: metadata.character || 'FIGHTER',
        isReady: false
      })

      // Send current player list to new player
      conn.send({
        type: MessageType.PLAYER_JOINED,
        data: {
          players: Array.from(this.players.entries()),
          hostId: this.localPlayerId
        },
        senderId: this.localPlayerId,
        timestamp: Date.now()
      })

      // Notify other players
      this.broadcast(MessageType.PLAYER_JOINED, {
        playerId: conn.peer,
        name: metadata.name,
        character: metadata.character
      }, conn.peer)

      this.emit('playerJoined', {
        playerId: conn.peer,
        name: metadata.name,
        character: metadata.character
      })
    })

    conn.on('data', (data) => {
      this.handleMessage(data as NetworkMessage)
    })

    conn.on('close', () => {
      console.log('[Network] Player disconnected:', conn.peer)
      this.connections.delete(conn.peer)
      this.players.delete(conn.peer)

      this.broadcast(MessageType.PLAYER_LEFT, {
        playerId: conn.peer
      })

      this.emit('playerLeft', { playerId: conn.peer })
    })
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: NetworkMessage) {
    // Emit event for message type
    this.emit(message.type, message.data, message.senderId)

    // If host, relay certain messages to other clients
    if (this.isHost && message.type === MessageType.INPUT) {
      // Host processes input, doesn't relay
    } else if (this.isHost) {
      // Relay other messages to all clients except sender
      this.broadcast(message.type, message.data, message.senderId)
    }
  }

  /**
   * Send message to host (or all clients if host)
   */
  send(type: MessageType, data: any) {
    const message: NetworkMessage = {
      type,
      data,
      senderId: this.localPlayerId,
      timestamp: Date.now()
    }

    if (this.isHost) {
      // Broadcast to all clients
      this.connections.forEach((conn) => {
        if (conn.open) {
          conn.send(message)
        }
      })
    } else {
      // Send to host
      const hostConn = this.connections.get(this.hostId)
      if (hostConn && hostConn.open) {
        hostConn.send(message)
      }
    }
  }

  /**
   * Broadcast to all except specified peer
   */
  broadcast(type: MessageType, data: any, excludePeer?: string) {
    const message: NetworkMessage = {
      type,
      data,
      senderId: this.localPlayerId,
      timestamp: Date.now()
    }

    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeer && conn.open) {
        conn.send(message)
      }
    })
  }

  /**
   * Send game state sync (host only, called at syncRate)
   */
  sendStateSync(gameState: any) {
    if (!this.isHost) return

    const now = Date.now()
    if (now - this.lastSyncTime < this.syncRate) return
    this.lastSyncTime = now

    this.send(MessageType.STATE_SYNC, gameState)
  }

  /**
   * Send player input (client only)
   */
  sendInput(input: { moveX: number, moveY: number, isShooting: boolean }) {
    if (this.isHost) return
    this.send(MessageType.INPUT, input)
  }

  /**
   * Register event handler
   */
  on(eventType: string, handler: EventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  /**
   * Unregister event handler
   */
  off(eventType: string, handler: EventHandler) {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Emit event
   */
  private emit(eventType: string, data: any, senderId?: string) {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.forEach(handler => handler(data, senderId))
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    this.connections.forEach(conn => conn.close())
    this.connections.clear()

    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }

    this.isConnected = false
    this.isHost = false
    this.players.clear()
  }

  /**
   * Generate random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  /**
   * Generate short invite code (6 digits)
   */
  private generateInviteCode(): string {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10).toString()
    }
    return code
  }

  /**
   * Get player count
   */
  getPlayerCount(): number {
    return this.players.size
  }

  /**
   * Check if game is full (2 players for coop)
   */
  isFull(): boolean {
    return this.players.size >= 2
  }
}

// Singleton instance
export const networkSystem = new NetworkSystem()
