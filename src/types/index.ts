// Types for the Data Analyst AI Application

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  visualization?: VisualizationData;
  sqlQuery?: string;
}

export interface VisualizationData {
  type: 'table' | 'bar' | 'line' | 'pie' | 'area';
  title: string;
  data: any[];
  columns: string[];
}

export interface AnalysisResult {
  message: string;
  visualization?: VisualizationData;
  sqlQuery?: string;
  insights?: string[];
}

export interface Dashboard {
  id: string;
  name: string;
  visualizations: VisualizationData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    maxFiles: number;
    maxRows: number;
    maxQueries: number;
    dashboards: number;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
