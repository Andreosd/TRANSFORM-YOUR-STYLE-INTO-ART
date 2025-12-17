
export interface OutfitBreakdown {
  top: string;
  bottom: string;
  footwear: string;
  accessories: string;
}

export interface OutfitAnalysis {
  breakdown: OutfitBreakdown;
  colorPalette: string[];
  styleCategory: string;
  materialHighlights: string[];
  aestheticVibe: string;
  recreationPrompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
