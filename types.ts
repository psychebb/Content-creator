
export enum SocialPlatform {
  REDNOTE = 'Rednote (Xiaohongshu)',
  TIKTOK = 'TikTok',
  INSTAGRAM = 'Instagram'
}

export enum ToneType {
  ORAL = 'Human Oral (Casual)',
  INSPIRATIONAL = 'Inspirational',
  PROFESSIONAL = 'Professional/Review',
  EXCITED = 'Excited/Hype'
}

export interface GenerationResult {
  identifiedItem: string;
  caption: string;
  hashtags: string[];
}

export interface MediaFile {
  url: string;
  type: 'image' | 'video';
  file: File;
}
