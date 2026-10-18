import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ProductItem,
  ClientItem,
  OrderItem,
  MediaAsset,
  PromptTemplate,
  ActivityLog,
  GitHubConfig,
  CloudinaryConfig,
  ServerSettings,
  ChatSession,
  AppWindowConfig,
  AppWindowId,
  ThemeType,
} from '../types/database';
import { INITIAL_PRODUCTS, INITIAL_CLIENTS, INITIAL_ORDERS, INITIAL_MEDIA_ASSETS, INITIAL_ACTIVITY_LOGS, INITIAL_GITHUB_CONFIG, INITIAL_CLOUDINARY_CONFIG } from '../data/seedDatabase';
import { INITIAL_PROMPT_TEMPLATES } from '../data/defaultPrompts';

interface ConfirmationRequest {
  title: string;
  message: string;
  entityName?: string;
  dangerLevel: 'high' | 'medium' | 'critical';
  confirmLabel: string;
  onConfirm: () => void;
}

interface DatabaseContextType {
  // Data
  products: ProductItem[];
  clients: ClientItem[];
  orders: OrderItem[];
  mediaAssets: MediaAsset[];
  promptTemplates: PromptTemplate[];
  activityLogs: ActivityLog[];
  githubConfig: GitHubConfig;
  cloudinaryConfig: CloudinaryConfig;
  settings: ServerSettings;
  chatSessions: ChatSession[];
  activeSessionId: string;
  windows: Record<AppWindowId, AppWindowConfig>;
  confirmation: ConfirmationRequest | null;

  // Sync & Storage States
  storageStats: { byteSize: number; totalRecords: number; lastSaved: string };
  isSyncingGitHub: boolean;
  gitHubSyncResult: { success: boolean; message: string; timestamp: string } | null;
  unsavedChanges: boolean;

  // Data Operations
  addProduct: (product: Omit<ProductItem, 'id' | 'lastUpdated'>) => void;
  updateProduct: (id: string, updates: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;

  addClient: (client: Omit<ClientItem, 'id'>) => void;
  updateClient: (id: string, updates: Partial<ClientItem>) => void;
  deleteClient: (id: string) => void;

  addOrder: (order: Omit<OrderItem, 'id'>) => void;
  updateOrder: (id: string, updates: Partial<OrderItem>) => void;
  deleteOrder: (id: string) => void;

  addMediaAsset: (asset: Omit<MediaAsset, 'id' | 'uploadedAt'>) => void;
  deleteMediaAsset: (id: string) => void;

  // Prompt Customization Operations (Boss Studio)
  savePromptTemplate: (id: string, template: Partial<PromptTemplate>) => void;
  resetPromptTemplate: (id: string) => void;

  // Chat Sessions (Natasha v5.6)
  createChatSession: () => string;
  switchChatSession: (id: string) => void;
  deleteChatSession: (id: string) => void;
  appendChatMessage: (
    sessionId: string,
    message: { role: 'user' | 'model'; content: string; tokensUsed?: number; tokensSaved?: number }
  ) => void;
  clearSessionHistory: (sessionId: string) => void;

  // Window Controls & Taskbar Pinning
  openWindow: (id: AppWindowId) => void;
  closeWindow: (id: AppWindowId) => void;
  minimizeWindow: (id: AppWindowId) => void;
  maximizeWindow: (id: AppWindowId) => void;
  togglePinApp: (id: AppWindowId) => void;
  bringToFront: (id: AppWindowId) => void;

  // Server & Security Controls
  togglePrivacyMode: () => void;
  maskSensitive: (text: string, type: 'email' | 'phone' | 'token' | 'general') => string;
  setTheme: (theme: ThemeType) => void;
  logActivity: (action: string, entity: string, details: string, status?: ActivityLog['status']) => void;
  saveGitHubConfig: (config: GitHubConfig) => void;
  saveCloudinaryConfig: (config: CloudinaryConfig) => void;
  syncWithGitHub: () => Promise<void>;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
  requestConfirmation: (request: ConfirmationRequest) => void;
  closeConfirmation: () => void;
  resetEntireDatabase: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

const STORAGE_KEY = 'raj_expo_server_database_v5';

const DEFAULT_WINDOWS: Record<AppWindowId, AppWindowConfig> = {
  chat: {
    id: 'chat',
    title: 'Natasha v5.6 Executive AI',
    iconName: 'Bot',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    pinnedToTaskbar: true,
  },
  prompts: {
    id: 'prompts',
    title: 'Boss Prompt Customisations',
    iconName: 'Sliders',
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 9,
    pinnedToTaskbar: true,
  },
  database: {
    id: 'database',
    title: 'Personal Database Hub',
    iconName: 'Database',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 8,
    pinnedToTaskbar: true,
  },
  github: {
    id: 'github',
    title: 'GitHub Repo Integration',
    iconName: 'GitBranch',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    pinnedToTaskbar: true,
  },
  cloudinary: {
    id: 'cloudinary',
    title: 'Cloudinary Media Storage',
    iconName: 'Image',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 6,
    pinnedToTaskbar: true,
  },
  logs: {
    id: 'logs',
    title: 'Activity & Audit Log',
    iconName: 'Activity',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 5,
    pinnedToTaskbar: false,
  },
  settings: {
    id: 'settings',
    title: 'Server Settings & Themes',
    iconName: 'Settings',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 4,
    pinnedToTaskbar: false,
  },
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved database or fallback to authentic seed data
  const [products, setProducts] = useState<ProductItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_products`);
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [clients, setClients] = useState<ClientItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_clients`);
      return stored ? JSON.parse(stored) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_orders`);
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_media`);
      return stored ? JSON.parse(stored) : INITIAL_MEDIA_ASSETS;
    } catch {
      return INITIAL_MEDIA_ASSETS;
    }
  });

  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_prompts`);
      return stored ? JSON.parse(stored) : INITIAL_PROMPT_TEMPLATES;
    } catch {
      return INITIAL_PROMPT_TEMPLATES;
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_logs`);
      return stored ? JSON.parse(stored) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_github`);
      return stored ? JSON.parse(stored) : INITIAL_GITHUB_CONFIG;
    } catch {
      return INITIAL_GITHUB_CONFIG;
    }
  });

  const [cloudinaryConfig, setCloudinaryConfig] = useState<CloudinaryConfig>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_cloudinary`);
      return stored ? JSON.parse(stored) : INITIAL_CLOUDINARY_CONFIG;
    } catch {
      return INITIAL_CLOUDINARY_CONFIG;
    }
  });

  const [settings, setSettings] = useState<ServerSettings>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return stored
        ? JSON.parse(stored)
        : {
            theme: 'oled',
            privacyMode: false,
            soundFeedback: true,
            memorySlidingWindow: 5,
          };
    } catch {
      return { theme: 'oled', privacyMode: false, soundFeedback: true, memorySlidingWindow: 5 };
    }
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      if (stored) return JSON.parse(stored);
      const initialId = 'sess-main';
      return [
        {
          id: initialId,
          title: 'Natasha v5.6 Live Briefing',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [
            {
              id: 'msg-init-1',
              role: 'model',
              content:
                'Natasha v5.6 operational online. Connected to Raj Expo Digitals Database. Active memory sliding window is set to 5 messages to preserve tokens. Ready for instructions, Boss.',
              timestamp: new Date().toISOString(),
              tokensUsed: 42,
              tokensSaved: 0,
            },
          ],
        },
      ];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return chatSessions[0]?.id || 'sess-main';
  });

  const [windows, setWindows] = useState<Record<AppWindowId, AppWindowConfig>>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_windows`);
      return stored ? JSON.parse(stored) : DEFAULT_WINDOWS;
    } catch {
      return DEFAULT_WINDOWS;
    }
  });

  const [topZ, setTopZ] = useState<number>(20);
  const [confirmation, setConfirmation] = useState<ConfirmationRequest | null>(null);
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [gitHubSyncResult, setGitHubSyncResult] = useState<{ success: boolean; message: string; timestamp: string } | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Sync settings theme to HTML body data-theme attribute
  useEffect(() => {
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Save changes to localStorage honestly
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_clients`, JSON.stringify(clients));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_media`, JSON.stringify(mediaAssets));
      localStorage.setItem(`${STORAGE_KEY}_prompts`, JSON.stringify(promptTemplates));
      localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(activityLogs));
      localStorage.setItem(`${STORAGE_KEY}_github`, JSON.stringify(githubConfig));
      localStorage.setItem(`${STORAGE_KEY}_cloudinary`, JSON.stringify(cloudinaryConfig));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(chatSessions));
      localStorage.setItem(`${STORAGE_KEY}_windows`, JSON.stringify(windows));
      setUnsavedChanges(false);
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }
  }, [products, clients, orders, mediaAssets, promptTemplates, activityLogs, githubConfig, cloudinaryConfig, settings, chatSessions, windows]);

  // Calculate actual storage size
  const storageStats = {
    byteSize:
      JSON.stringify(products).length +
      JSON.stringify(clients).length +
      JSON.stringify(orders).length +
      JSON.stringify(mediaAssets).length +
      JSON.stringify(promptTemplates).length +
      JSON.stringify(activityLogs).length,
    totalRecords: products.length + clients.length + orders.length + mediaAssets.length + promptTemplates.length,
    lastSaved: new Date().toLocaleTimeString(),
  };

  const logActivity = useCallback((action: string, entity: string, details: string, status: ActivityLog['status'] = 'info') => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      details,
      user: 'Boss Admin',
      status,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    setUnsavedChanges(true);
  }, []);

  const requestConfirmation = useCallback((req: ConfirmationRequest) => {
    setConfirmation(req);
  }, []);

  const closeConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  // Window Controls
  const bringToFront = useCallback((id: AppWindowId) => {
    setTopZ((prev) => {
      const nextZ = prev + 1;
      setWindows((w) => ({
        ...w,
        [id]: { ...w[id], zIndex: nextZ, isMinimized: false, isOpen: true },
      }));
      return nextZ;
    });
  }, []);

  const openWindow = useCallback(
    (id: AppWindowId) => {
      bringToFront(id);
    },
    [bringToFront]
  );

  const closeWindow = useCallback((id: AppWindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false },
    }));
  }, []);

  const minimizeWindow = useCallback((id: AppWindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: !prev[id].isMinimized },
    }));
  }, []);

  const maximizeWindow = useCallback((id: AppWindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized },
    }));
  }, []);

  const togglePinApp = useCallback((id: AppWindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], pinnedToTaskbar: !prev[id].pinnedToTaskbar },
    }));
  }, []);

  // Products CRUD
  const addProduct = useCallback(
    (product: Omit<ProductItem, 'id' | 'lastUpdated'>) => {
      const newProduct: ProductItem = {
        ...product,
        id: `prod-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      logActivity('Record Created', 'Products', `Created item ${newProduct.sku}: ${newProduct.title}`, 'success');
    },
    [logActivity]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<ProductItem>) => {
      setProducts((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item))
      );
      logActivity('Record Updated', 'Products', `Updated item ID: ${id}`, 'info');
    },
    [logActivity]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const target = products.find((p) => p.id === id);
      if (!target) return;
      requestConfirmation({
        title: 'Confirm Product Deletion',
        message: `Are you sure you want to delete "${target.title}" (${target.sku})? This record will be permanently purged from the local database.`,
        entityName: target.title,
        dangerLevel: 'high',
        confirmLabel: 'Delete Product Record',
        onConfirm: () => {
          setProducts((prev) => prev.filter((p) => p.id !== id));
          logActivity('Record Deleted', 'Products', `Purged ${target.sku}: ${target.title}`, 'warning');
          closeConfirmation();
        },
      });
    },
    [products, requestConfirmation, logActivity, closeConfirmation]
  );

  // Clients CRUD
  const addClient = useCallback(
    (client: Omit<ClientItem, 'id'>) => {
      const newClient: ClientItem = {
        ...client,
        id: `client-${Date.now()}`,
      };
      setClients((prev) => [newClient, ...prev]);
      logActivity('Client Added', 'Clients', `Added ${newClient.name} (${newClient.company})`, 'success');
    },
    [logActivity]
  );

  const updateClient = useCallback(
    (id: string, updates: Partial<ClientItem>) => {
      setClients((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      logActivity('Client Updated', 'Clients', `Modified client ID: ${id}`, 'info');
    },
    [logActivity]
  );

  const deleteClient = useCallback(
    (id: string) => {
      const target = clients.find((c) => c.id === id);
      if (!target) return;
      requestConfirmation({
        title: 'Confirm Client Deletion',
        message: `Delete client "${target.name}" from ${target.company}? Order history reference will remain archived in orders.`,
        entityName: target.name,
        dangerLevel: 'high',
        confirmLabel: 'Delete Client Record',
        onConfirm: () => {
          setClients((prev) => prev.filter((c) => c.id !== id));
          logActivity('Client Deleted', 'Clients', `Deleted client ${target.name}`, 'warning');
          closeConfirmation();
        },
      });
    },
    [clients, requestConfirmation, logActivity, closeConfirmation]
  );

  // Orders CRUD
  const addOrder = useCallback(
    (order: Omit<OrderItem, 'id'>) => {
      const newOrder: OrderItem = {
        ...order,
        id: `ord-${Date.now()}`,
      };
      setOrders((prev) => [newOrder, ...prev]);
      logActivity('Order Logged', 'Orders', `Created ${newOrder.orderNumber} for ${newOrder.clientName} ($${newOrder.amount})`, 'success');
    },
    [logActivity]
  );

  const updateOrder = useCallback(
    (id: string, updates: Partial<OrderItem>) => {
      setOrders((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      logActivity('Order Updated', 'Orders', `Updated order ID: ${id}`, 'info');
    },
    [logActivity]
  );

  const deleteOrder = useCallback(
    (id: string) => {
      const target = orders.find((o) => o.id === id);
      if (!target) return;
      requestConfirmation({
        title: 'Confirm Order Purge',
        message: `Delete order ${target.orderNumber} ($${target.amount})? This will remove the audit entry for this transaction.`,
        entityName: target.orderNumber,
        dangerLevel: 'high',
        confirmLabel: 'Delete Order',
        onConfirm: () => {
          setOrders((prev) => prev.filter((o) => o.id !== id));
          logActivity('Order Deleted', 'Orders', `Removed order ${target.orderNumber}`, 'warning');
          closeConfirmation();
        },
      });
    },
    [orders, requestConfirmation, logActivity, closeConfirmation]
  );

  // Media CRUD
  const addMediaAsset = useCallback(
    (asset: Omit<MediaAsset, 'id' | 'uploadedAt'>) => {
      const newAsset: MediaAsset = {
        ...asset,
        id: `media-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      setMediaAssets((prev) => [newAsset, ...prev]);
      logActivity('Media Added', 'Cloudinary', `Indexed asset ${newAsset.name}`, 'info');
    },
    [logActivity]
  );

  const deleteMediaAsset = useCallback(
    (id: string) => {
      const target = mediaAssets.find((m) => m.id === id);
      if (!target) return;
      setMediaAssets((prev) => prev.filter((m) => m.id !== id));
      logActivity('Media Deleted', 'Cloudinary', `Removed asset ${target.name}`, 'warning');
    },
    [mediaAssets, logActivity]
  );

  // Boss Prompt Customization Studio
  const savePromptTemplate = useCallback(
    (id: string, updates: Partial<PromptTemplate>) => {
      setPromptTemplates((prev) =>
        prev.map((tpl) => {
          if (tpl.id === id) {
            return {
              ...tpl,
              ...updates,
              isCustomized: true,
              version: tpl.version + 1,
              lastUpdated: new Date().toISOString(),
            };
          }
          return tpl;
        })
      );
      const target = promptTemplates.find((t) => t.id === id);
      logActivity('Prompt Customized', 'Prompt Studio', `Boss updated prompt: ${target?.title || id}`, 'success');
    },
    [promptTemplates, logActivity]
  );

  const resetPromptTemplate = useCallback(
    (id: string) => {
      const defaultTpl = INITIAL_PROMPT_TEMPLATES.find((t) => t.id === id);
      if (!defaultTpl) return;
      setPromptTemplates((prev) =>
        prev.map((tpl) => (tpl.id === id ? { ...defaultTpl, lastUpdated: new Date().toISOString() } : tpl))
      );
      logActivity('Prompt Reset', 'Prompt Studio', `Reset prompt ${defaultTpl.title} to factory default`, 'info');
    },
    [logActivity]
  );

  // Chat Sessions (Natasha v5.6)
  const createChatSession = useCallback(() => {
    const newId = `sess-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `Briefing #${chatSessions.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          content: 'Natasha v5.6 ready for mission directive. Token context sliding window engaged.',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    logActivity('Chat Session Created', 'Natasha v5.6', `Opened new session: ${newSession.title}`, 'info');
    return newId;
  }, [chatSessions.length, logActivity]);

  const switchChatSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const deleteChatSession = useCallback(
    (id: string) => {
      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (activeSessionId === id && filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
      logActivity('Chat Session Deleted', 'Natasha v5.6', `Deleted session ${id}`, 'info');
    },
    [activeSessionId, logActivity]
  );

  const appendChatMessage = useCallback(
    (sessionId: string, message: { role: 'user' | 'model'; content: string; tokensUsed?: number; tokensSaved?: number }) => {
      const msgItem = {
        ...message,
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
      };
      setChatSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === sessionId) {
            // Auto update session title from first user query if still generic
            let newTitle = sess.title;
            if (message.role === 'user' && (sess.title.startsWith('Briefing #') || sess.title.startsWith('New Session'))) {
              newTitle = message.content.slice(0, 32).trim() + (message.content.length > 32 ? '...' : '');
            }
            return {
              ...sess,
              title: newTitle,
              updatedAt: new Date().toISOString(),
              messages: [...sess.messages, msgItem],
            };
          }
          return sess;
        })
      );
    },
    []
  );

  const clearSessionHistory = useCallback(
    (sessionId: string) => {
      setChatSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === sessionId) {
            return {
              ...sess,
              messages: [
                {
                  id: `msg-${Date.now()}`,
                  role: 'model',
                  content: 'History cleared. Active context reset to zero tokens.',
                  timestamp: new Date().toISOString(),
                },
              ],
            };
          }
          return sess;
        })
      );
      logActivity('Chat History Cleared', 'Natasha v5.6', `Context flushed for session ${sessionId}`, 'info');
    },
    [logActivity]
  );

  // Privacy Protection Mode
  const togglePrivacyMode = useCallback(() => {
    setSettings((prev) => {
      const nextVal = !prev.privacyMode;
      logActivity('Privacy Shield Toggled', 'Security Guard', `Data privacy masking set to: ${nextVal ? 'ENABLED' : 'DISABLED'}`, 'info');
      return { ...prev, privacyMode: nextVal };
    });
  }, [logActivity]);

  const maskSensitive = useCallback(
    (text: string, type: 'email' | 'phone' | 'token' | 'general'): string => {
      if (!settings.privacyMode) return text;
      if (!text) return '—';

      if (type === 'email') {
        const parts = text.split('@');
        if (parts.length === 2) {
          const name = parts[0];
          return `${name.slice(0, 2)}••••••@${parts[1]}`;
        }
        return '••••••••@masked.com';
      }

      if (type === 'phone') {
        return text.replace(/\d(?=\d{3})/g, '•');
      }

      if (type === 'token') {
        return 'ghp_••••••••••••••••••••••••••••••••••••';
      }

      return '••••••••';
    },
    [settings.privacyMode]
  );

  const setTheme = useCallback(
    (theme: ThemeType) => {
      setSettings((prev) => ({ ...prev, theme }));
      logActivity('Theme Changed', 'UI Engine', `Switched theme to ${theme}`, 'info');
    },
    [logActivity]
  );

  const saveGitHubConfig = useCallback(
    (config: GitHubConfig) => {
      setGithubConfig(config);
      logActivity('GitHub Config Saved', 'GitHub Hub', `Updated repository link to ${config.owner}/${config.repo}`, 'success');
    },
    [logActivity]
  );

  const saveCloudinaryConfig = useCallback(
    (config: CloudinaryConfig) => {
      setCloudinaryConfig(config);
      logActivity('Cloudinary Config Saved', 'Cloudinary', `Updated cloud name: ${config.cloudName}`, 'success');
    },
    [logActivity]
  );

  // Honest GitHub Sync
  const syncWithGitHub = useCallback(async () => {
    if (!githubConfig.owner || !githubConfig.repo || !githubConfig.token) {
      setGitHubSyncResult({
        success: false,
        message: 'Cannot sync: GitHub Owner, Repository Name, and Personal Access Token must be configured in settings.',
        timestamp: new Date().toLocaleTimeString(),
      });
      logActivity('GitHub Sync Attempt', 'GitHub Sync', 'Failed: Missing repository credentials', 'error');
      return;
    }

    setIsSyncingGitHub(true);
    setGitHubSyncResult(null);

    const backupSnapshot = {
      timestamp: new Date().toISOString(),
      server: 'Raj Expo Digitals Server v5.6',
      products,
      clients,
      orders,
      mediaAssets,
      promptTemplates,
    };

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          branch: githubConfig.branch || 'main',
          token: githubConfig.token,
          filePath: `database/raj-expo-backup-${new Date().toISOString().split('T')[0]}.json`,
          content: JSON.stringify(backupSnapshot, null, 2),
          commitMessage: `Honest Database Backup [Raj Expo Digitals Server] - ${new Date().toLocaleString()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGitHubSyncResult({
          success: true,
          message: `Successfully pushed backup snapshot! Commit SHA: ${data.commitSha.slice(0, 7)}`,
          timestamp: new Date().toLocaleTimeString(),
        });
        setGithubConfig((prev) => ({
          ...prev,
          lastSync: new Date().toISOString(),
          lastCommitSha: data.commitSha,
        }));
        logActivity('GitHub Sync Succeeded', 'GitHub Hub', `Pushed snapshot. Commit SHA: ${data.commitSha.slice(0, 7)}`, 'success');
      } else {
        setGitHubSyncResult({
          success: false,
          message: data.error || 'GitHub API returned an unsuccessful response.',
          timestamp: new Date().toLocaleTimeString(),
        });
        logActivity('GitHub Sync Failed', 'GitHub Hub', data.error || 'API error', 'error');
      }
    } catch (err: any) {
      setGitHubSyncResult({
        success: false,
        message: err.message || 'Network error communicating with server GitHub sync route.',
        timestamp: new Date().toLocaleTimeString(),
      });
      logActivity('GitHub Sync Error', 'GitHub Hub', err.message || 'Connection failure', 'error');
    } finally {
      setIsSyncingGitHub(false);
    }
  }, [githubConfig, products, clients, orders, mediaAssets, promptTemplates, logActivity]);

  // JSON Export & Import
  const exportDatabaseJson = useCallback(() => {
    const fullDump = {
      exportVersion: '5.6',
      generatedAt: new Date().toISOString(),
      server: 'Raj Expo Digitals Server',
      tables: {
        products,
        clients,
        orders,
        mediaAssets,
        promptTemplates,
        activityLogs,
      },
    };
    const blob = new Blob([JSON.stringify(fullDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raj-expo-server-dump-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logActivity('Database Exported', 'Database Hub', 'Downloaded full JSON database archive', 'info');
  }, [products, clients, orders, mediaAssets, promptTemplates, activityLogs, logActivity]);

  const importDatabaseJson = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed.tables && !parsed.products) {
          throw new Error('Invalid schema format. Must contain tables object.');
        }

        const newProds = parsed.tables?.products || parsed.products || products;
        const newClients = parsed.tables?.clients || parsed.clients || clients;
        const newOrders = parsed.tables?.orders || parsed.orders || orders;
        const newMedia = parsed.tables?.mediaAssets || parsed.mediaAssets || mediaAssets;
        const newPrompts = parsed.tables?.promptTemplates || parsed.promptTemplates || promptTemplates;

        setProducts(newProds);
        setClients(newClients);
        setOrders(newOrders);
        setMediaAssets(newMedia);
        setPromptTemplates(newPrompts);

        logActivity('Database Restored', 'Database Hub', `Imported database snapshot with ${newProds.length} products and ${newClients.length} clients`, 'success');
        return true;
      } catch (err: any) {
        logActivity('Import Failed', 'Database Hub', `JSON parse error: ${err.message}`, 'error');
        return false;
      }
    },
    [products, clients, orders, mediaAssets, promptTemplates, logActivity]
  );

  const resetEntireDatabase = useCallback(() => {
    requestConfirmation({
      title: 'CRITICAL: Reset Entire Database',
      message: 'This will purge all local changes and restore original factory records for Raj Expo Digitals. All customized prompts, clients, and orders added will be reset.',
      dangerLevel: 'critical',
      confirmLabel: 'Reset Entire Database',
      onConfirm: () => {
        setProducts(INITIAL_PRODUCTS);
        setClients(INITIAL_CLIENTS);
        setOrders(INITIAL_ORDERS);
        setMediaAssets(INITIAL_MEDIA_ASSETS);
        setPromptTemplates(INITIAL_PROMPT_TEMPLATES);
        logActivity('Database Factory Reset', 'System Engine', 'Reverted database to baseline factory records', 'warning');
        closeConfirmation();
      },
    });
  }, [requestConfirmation, closeConfirmation, logActivity]);

  return (
    <DatabaseContext.Provider
      value={{
        products,
        clients,
        orders,
        mediaAssets,
        promptTemplates,
        activityLogs,
        githubConfig,
        cloudinaryConfig,
        settings,
        chatSessions,
        activeSessionId,
        windows,
        confirmation,
        storageStats,
        isSyncingGitHub,
        gitHubSyncResult,
        unsavedChanges,

        addProduct,
        updateProduct,
        deleteProduct,

        addClient,
        updateClient,
        deleteClient,

        addOrder,
        updateOrder,
        deleteOrder,

        addMediaAsset,
        deleteMediaAsset,

        savePromptTemplate,
        resetPromptTemplate,

        createChatSession,
        switchChatSession,
        deleteChatSession,
        appendChatMessage,
        clearSessionHistory,

        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        togglePinApp,
        bringToFront,

        togglePrivacyMode,
        maskSensitive,
        setTheme,
        logActivity,
        saveGitHubConfig,
        saveCloudinaryConfig,
        syncWithGitHub,
        exportDatabaseJson,
        importDatabaseJson,
        requestConfirmation,
        closeConfirmation,
        resetEntireDatabase,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
