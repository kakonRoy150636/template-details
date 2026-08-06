export type Package = 'regular' | 'standard' | 'premium';
export type Technology = 'html' | 'react' | 'nextjs' | 'wordpress';
export type ColorTheme = 'dark' | 'light' | 'luxury-gold' | 'blue' | 'minimal';

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string; // e.g. "regular:wedding"
  package: Package;
  technology: Technology;
  color_theme: ColorTheme;
  price_bdt: number;
  thumbnail_url: string;
  demo_url: string;
  pages: number;
  animation_level: number; // 1-5
  seo_score: number; // 0-100
  mobile_score: number;
  speed_score: number;
  accessibility_score: number;
  customization_level: number; // 1-5
  tags: string[];
  features: string[];
  gallery: string[];
  video_url: string;
  popularity: number;
  wishlist_count: number;
  orders_count: number;
  trending: boolean;
  is_new: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  template_id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  templates?: Template[];
  timestamp: number;
}
