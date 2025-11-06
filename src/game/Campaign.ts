export interface CampaignLevel {
  levelNumber: number
  name: string
  description: string
  difficulty: number // Multiplier for enemy stats and spawn rate
  winTime: number // Time in seconds required to win the level
  creditsReward: number
}

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  {
    levelNumber: 0,
    name: 'First Contact',
    description: 'Survive for 3 minutes against the initial wave.',
    difficulty: 1.0,
    winTime: 180,
    creditsReward: 100,
  },
  {
    levelNumber: 1,
    name: 'Rising Storm',
    description: 'The enemy intensifies. Survive for 4 minutes.',
    difficulty: 1.3,
    winTime: 240,
    creditsReward: 150,
  },
  {
    levelNumber: 2,
    name: 'Overwhelming Force',
    description: 'Hordes of enemies approach. Survive for 5 minutes.',
    difficulty: 1.6,
    winTime: 300,
    creditsReward: 200,
  },
  {
    levelNumber: 3,
    name: 'Endless Swarm',
    description: 'The ultimate test. Survive for 6 minutes.',
    difficulty: 2.0,
    winTime: 360,
    creditsReward: 300,
  },
  {
    levelNumber: 4,
    name: 'Inferno',
    description: 'Only the strongest survive. 7 minutes of chaos.',
    difficulty: 2.5,
    winTime: 420,
    creditsReward: 400,
  },
]

export class CampaignManager {
  private currentLevelIndex: number = 0

  constructor(levelIndex: number = 0) {
    this.currentLevelIndex = levelIndex
  }

  getCurrentLevel(): CampaignLevel {
    return CAMPAIGN_LEVELS[this.currentLevelIndex]
  }

  getLevelCount(): number {
    return CAMPAIGN_LEVELS.length
  }

  getDifficulty(): number {
    return this.getCurrentLevel().difficulty
  }

  getWinTime(): number {
    return this.getCurrentLevel().winTime
  }

  getCreditsReward(): number {
    return this.getCurrentLevel().creditsReward
  }

  getCurrentLevelIndex(): number {
    return this.currentLevelIndex
  }
}
