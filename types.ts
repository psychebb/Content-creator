
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

export enum Language {
  CHINESE = 'Chinese',
  ENGLISH = 'English',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean'
}

export interface GenerationResult {
  identifiedItem: string;
  caption: string;
  hashtags: string[];
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  file: File;
}
