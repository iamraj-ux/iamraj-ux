export interface ProductItem {
  id: string;
  sku: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Archived';
  cloudinaryUrl?: string;
  labels: string[];
  description: string;
  lastUpdated: string;
}

export interface ClientItem {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'VIP' | 'Pending' | 'Inactive';
  notes: string;
  lastContact: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  clientName: string;
  amount: number;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Pending';
  date: string;
  itemsSummary: string;
  paymentMethod: string;
}

export interface MediaAsset {
  id: string;
  publicId: string;
  name: string;
  format: string;
  bytes: number;
  url: string;
  altText: string;
  tags: string[];
  uploadedAt: string;
}

export interface PromptVariable {
  key: string;
  label: string;
  defaultValue: string;
  description: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: 'natasha' | 'ask_ai' | 'write' | 'labels' | 'descriptions' | 'gmail' | 'whatsapp' | 'cloudinary' | 'database';
  systemInstruction: string;
  template: string;
  variables: PromptVariable[];
  temperature: number;
  isCustomized: boolean;
  version: number;
  lastUpdated: string;
  description: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  details: string;
  user: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  lastSync?: string;
  lastCommitSha?: string;
  autoSync: boolean;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey: string;
  folder: string;
  isConfigured: boolean;
}

export type ThemeType = 'oled' | 'slate' | 'emerald' | 'titanium' | 'espresso';

export interface ServerSettings {
  theme: ThemeType;
  privacyMode: boolean;
  soundFeedback: boolean;
  memorySlidingWindow: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: string;
    tokensUsed?: number;
    tokensSaved?: number;
  }>;
}

export type AppWindowId =
  | 'chat'
  | 'prompts'
  | 'database'
  | 'github'
  | 'cloudinary'
  | 'logs'
  | 'settings';

export interface AppWindowConfig {
  id: AppWindowId;
  title: string;
  iconName: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  pinnedToTaskbar: boolean;
}
