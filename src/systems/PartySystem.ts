import { networkSystem, MessageType } from './NetworkSystem'
import { CharacterType, CHARACTER_CONFIGS } from '../game/Character'
import { GameState } from '../game/GameState'

export interface PartySlot {
  peerId: string | null
  name: string
  character: CharacterType
  isHost: boolean
  isEmpty: boolean
}

export interface PartyState {
  slots: PartySlot[]
  inviteCode: string
  isInParty: boolean
  localSlotIndex: number
}

type PartyEventHandler = (data: any) => void

class PartySystem {
  private state: PartyState = {
    slots: [
      { peerId: null, name: '', character: CharacterType.VULCAN, isHost: false, isEmpty: true },
      { peerId: null, name: '', character: CharacterType.VULCAN, isHost: false, isEmpty: true }
    ],
    inviteCode: '',
    isInParty: false,
    localSlotIndex: -1
  }

  private eventHandlers: Map<string, PartyEventHandler[]> = new Map()
  private playerName: string = ''

  constructor() {
    this.setupNetworkHandlers()
  }

  private setupNetworkHandlers() {
    // Handle join requests (host only)
    networkSystem.on(MessageType.PLAYER_JOINED, (data, senderId) => {
      if (networkSystem.isHost && senderId) {
        this.handleJoinRequest(data, senderId)
      } else if (!networkSystem.isHost && data.players) {
        // Client received initial player list from host
        this.handlePartySyncFromHost(data)
      }
    })

    // Handle player leaving
    networkSystem.on(MessageType.PLAYER_LEFT, (data) => {
      this.handlePlayerLeft(data.playerId)
    })

    // Handle disconnection
    networkSystem.on('disconnected', () => {
      this.resetParty()
      this.emit('partyUpdated', this.state)
      this.emit('disconnected', {})
    })

    // Handle game start
    networkSystem.on(MessageType.GAME_START, () => {
      this.emit('gameStart', {})
    })

    // Handle state sync messages (including character/name changes from clients)
    networkSystem.on(MessageType.STATE_SYNC, (data, senderId) => {
      if (networkSystem.isHost && data.type === 'character_change' && senderId) {
        // Find the slot for this player and update their character
        const slotIndex = this.state.slots.findIndex(slot => slot.peerId === senderId)
        if (slotIndex !== -1) {
          this.state.slots[slotIndex].character = data.character
          this.broadcastPartySync()
          this.emit('partyUpdated', this.state)
        }
      } else if (networkSystem.isHost && data.type === 'name_change' && senderId) {
        // Find the slot for this player and update their name
        const slotIndex = this.state.slots.findIndex(slot => slot.peerId === senderId)
        if (slotIndex !== -1) {
          this.state.slots[slotIndex].name = data.name
          this.broadcastPartySync()
          this.emit('partyUpdated', this.state)
        }
      } else if (!networkSystem.isHost && data.type === 'party_sync') {
        // Client received party sync from host
        this.state.slots = data.slots.map((slot: any) => ({
          peerId: slot.peerId,
          name: slot.name,
          character: slot.character as CharacterType,
          isHost: slot.isHost,
          isEmpty: slot.isEmpty
        }))

        // Update local slot index
        this.state.localSlotIndex = this.state.slots.findIndex(
          slot => slot.peerId === networkSystem.localPlayerId
        )

        this.emit('partyUpdated', this.state)
      }
    })
  }

  /**
   * Host a new party
   */
  async hostParty(playerName: string): Promise<string> {
    this.playerName = playerName
    const character = GameState.getInstance().getSelectedCharacter()

    try {
      const inviteCode = await networkSystem.hostGame(playerName, character)

      // Set up host slot
      this.state.slots[0] = {
        peerId: networkSystem.localPlayerId,
        name: playerName.substring(0, 3).toUpperCase(),
        character: character,
        isHost: true,
        isEmpty: false
      }
      this.state.slots[1] = {
        peerId: null,
        name: '',
        character: CharacterType.VULCAN,
        isHost: false,
        isEmpty: true
      }

      this.state.inviteCode = inviteCode
      this.state.isInParty = true
      this.state.localSlotIndex = 0

      this.emit('partyUpdated', this.state)
      return inviteCode
    } catch (error) {
      console.error('[PartySystem] Failed to host:', error)
      throw error
    }
  }

  /**
   * Join an existing party
   */
  async joinParty(inviteCode: string, playerName: string): Promise<void> {
    this.playerName = playerName
    const character = GameState.getInstance().getSelectedCharacter()

    try {
      await networkSystem.joinGame(inviteCode, playerName, character)
      this.state.inviteCode = inviteCode
      this.state.isInParty = true
      // localSlotIndex will be set when we receive party sync from host
    } catch (error) {
      console.error('[PartySystem] Failed to join:', error)
      throw error
    }
  }

  /**
   * Handle join request (host only)
   */
  private handleJoinRequest(data: { name: string, character: string }, peerId: string) {
    // Find empty slot
    const emptySlotIndex = this.state.slots.findIndex(slot => slot.isEmpty)
    if (emptySlotIndex === -1) {
      console.log('[PartySystem] Party is full, rejecting:', peerId)
      return
    }

    // Add player to slot
    this.state.slots[emptySlotIndex] = {
      peerId: peerId,
      name: data.name.substring(0, 3).toUpperCase(),
      character: data.character as CharacterType,
      isHost: false,
      isEmpty: false
    }

    // Send party sync to all players
    this.broadcastPartySync()
    this.emit('partyUpdated', this.state)
  }

  /**
   * Handle party sync received from host
   */
  private handlePartySyncFromHost(data: { players: [string, any][], hostId: string }) {
    // Rebuild slots from player list
    this.state.slots = [
      { peerId: null, name: '', character: CharacterType.VULCAN, isHost: false, isEmpty: true },
      { peerId: null, name: '', character: CharacterType.VULCAN, isHost: false, isEmpty: true }
    ]

    let slotIndex = 0
    for (const [peerId, playerInfo] of data.players) {
      if (slotIndex >= 2) break

      this.state.slots[slotIndex] = {
        peerId: peerId,
        name: playerInfo.name.substring(0, 3).toUpperCase(),
        character: playerInfo.character as CharacterType,
        isHost: peerId === data.hostId,
        isEmpty: false
      }

      if (peerId === networkSystem.localPlayerId) {
        this.state.localSlotIndex = slotIndex
      }

      slotIndex++
    }

    this.emit('partyUpdated', this.state)
  }

  /**
   * Handle player leaving
   */
  private handlePlayerLeft(playerId: string) {
    const slotIndex = this.state.slots.findIndex(slot => slot.peerId === playerId)
    if (slotIndex !== -1) {
      this.state.slots[slotIndex] = {
        peerId: null,
        name: '',
        character: CharacterType.VULCAN,
        isHost: false,
        isEmpty: true
      }

      if (networkSystem.isHost) {
        this.broadcastPartySync()
      }

      this.emit('partyUpdated', this.state)
    }
  }

  /**
   * Broadcast party state to all players (host only)
   */
  private broadcastPartySync() {
    if (!networkSystem.isHost) return

    const syncData = {
      slots: this.state.slots.map(slot => ({
        peerId: slot.peerId,
        name: slot.name,
        character: slot.character,
        isHost: slot.isHost,
        isEmpty: slot.isEmpty
      }))
    }

    // Use STATE_SYNC for party updates
    networkSystem.send(MessageType.STATE_SYNC, { type: 'party_sync', ...syncData })
  }

  /**
   * Update local player's character selection
   */
  updateCharacter(character: CharacterType) {
    if (this.state.localSlotIndex === -1) return

    this.state.slots[this.state.localSlotIndex].character = character

    if (networkSystem.isHost) {
      this.broadcastPartySync()
    } else {
      // Send update to host
      networkSystem.send(MessageType.STATE_SYNC, {
        type: 'character_change',
        character: character
      })
    }

    this.emit('partyUpdated', this.state)
  }

  /**
   * Update local player's name
   */
  updateName(name: string) {
    if (this.state.localSlotIndex === -1) return

    this.playerName = name
    this.state.slots[this.state.localSlotIndex].name = name.substring(0, 3).toUpperCase()

    if (networkSystem.isHost) {
      this.broadcastPartySync()
    } else {
      // Send update to host
      networkSystem.send(MessageType.STATE_SYNC, {
        type: 'name_change',
        name: name.substring(0, 3).toUpperCase()
      })
    }

    this.emit('partyUpdated', this.state)
  }

  /**
   * Start the game (host only)
   */
  startGame() {
    if (!networkSystem.isHost) return
    if (this.getPlayerCount() < 2) return

    networkSystem.send(MessageType.GAME_START, {})
    this.emit('gameStart', {})
  }

  /**
   * Leave the party
   */
  leaveParty() {
    networkSystem.disconnect()
    this.resetParty()
    this.emit('partyUpdated', this.state)
  }

  /**
   * Reset party state
   */
  private resetParty() {
    this.state = {
      slots: [
        { peerId: null, name: '', character: CharacterType.VULCAN, isHost: false, isEmpty: true },
        { peerId: null, name: '', character: CharacterType.VULCAN, isHost: false, isEmpty: true }
      ],
      inviteCode: '',
      isInParty: false,
      localSlotIndex: -1
    }
  }

  /**
   * Get current party state
   */
  getState(): PartyState {
    return this.state
  }

  /**
   * Get player count
   */
  getPlayerCount(): number {
    return this.state.slots.filter(slot => !slot.isEmpty).length
  }

  /**
   * Check if party is full
   */
  isFull(): boolean {
    return this.getPlayerCount() >= 2
  }

  /**
   * Check if local player is host
   */
  isHost(): boolean {
    return networkSystem.isHost
  }

  /**
   * Check if in a party
   */
  isInParty(): boolean {
    return this.state.isInParty
  }

  /**
   * Get invite code
   */
  getInviteCode(): string {
    return this.state.inviteCode
  }

  /**
   * Get other player's slot (for game scene)
   */
  getOtherPlayerSlot(): PartySlot | null {
    const otherIndex = this.state.localSlotIndex === 0 ? 1 : 0
    const slot = this.state.slots[otherIndex]
    return slot.isEmpty ? null : slot
  }

  /**
   * Get local player's slot
   */
  getLocalPlayerSlot(): PartySlot | null {
    if (this.state.localSlotIndex === -1) return null
    return this.state.slots[this.state.localSlotIndex]
  }

  /**
   * Register event handler
   */
  on(eventType: string, handler: PartyEventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, [])
    }
    this.eventHandlers.get(eventType)!.push(handler)
  }

  /**
   * Unregister event handler
   */
  off(eventType: string, handler: PartyEventHandler) {
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
  private emit(eventType: string, data: any) {
    const handlers = this.eventHandlers.get(eventType)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }
}

// Singleton instance
export const partySystem = new PartySystem()
