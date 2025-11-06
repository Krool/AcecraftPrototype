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
    description: 'Your first mission. Learn the basics.',
    difficulty: 1.0,
    winTime: 180,
    creditsReward: 100,
  },
  {
    levelNumber: 1,
    name: 'Escalation',
    description: 'Enemy forces are growing stronger.',
    difficulty: 1.2,
    winTime: 180,
    creditsReward: 125,
  },
  {
    levelNumber: 2,
    name: 'Rising Threat',
    description: 'The enemy is adapting to your tactics.',
    difficulty: 1.4,
    winTime: 180,
    creditsReward: 150,
  },
  {
    levelNumber: 3,
    name: 'Heavy Resistance',
    description: 'Waves of enemies approach without end.',
    difficulty: 1.7,
    winTime: 180,
    creditsReward: 175,
  },
  {
    levelNumber: 4,
    name: 'Breaking Point',
    description: 'Only the prepared will survive.',
    difficulty: 2.0,
    winTime: 180,
    creditsReward: 200,
  },
  {
    levelNumber: 5,
    name: 'Overwhelming Force',
    description: 'The enemy commits massive resources.',
    difficulty: 2.4,
    winTime: 180,
    creditsReward: 250,
  },
  {
    levelNumber: 6,
    name: 'Desperate Hour',
    description: 'They will not stop coming.',
    difficulty: 2.8,
    winTime: 180,
    creditsReward: 300,
  },
  {
    levelNumber: 7,
    name: 'Eclipse',
    description: 'The sky darkens with enemy ships.',
    difficulty: 3.2,
    winTime: 180,
    creditsReward: 350,
  },
  {
    levelNumber: 8,
    name: 'Apocalypse',
    description: 'This is their full armada.',
    difficulty: 3.7,
    winTime: 180,
    creditsReward: 400,
  },
  {
    levelNumber: 9,
    name: 'Armageddon',
    description: 'The final test. Only legends survive.',
    difficulty: 4.2,
    winTime: 180,
    creditsReward: 500,
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
