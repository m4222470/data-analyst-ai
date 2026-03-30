/**
 * API Service - Frontend
 * ====================
 * Handles all API communication with the backend.
 * Provides authentication, file upload, and query analysis.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export const apiConfig: ApiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
};

// Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  subscription_tier: string;
  queries_used: number;
  queries_limit: number;
  files_uploaded: number;
  files_limit: number;
  created_at: string;
  last_login?: string;
  openai_api_key?: string;
  openai_api_key_set?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  full_name?: string;
}

export interface DataFile {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  row_count?: number;
  column_count?: number;
  column_names?: string[];
  column_types?: Record<string, string>;
  is_processed: boolean;
  uploaded_at: string;
  is_public?: boolean;
  share_token?: string;
}

export interface FileList {
  files: DataFile[];
  total: number;
  page: number;
  page_size: number;
}

export interface AnalysisRequest {
  query?: string;
  natural_language?: string;
  file_id?: number | string;
  data?: Record<string, unknown>[];
  columns?: string[];
  include_sql?: boolean;
  include_visualization?: boolean;
  language?: string;
}

export interface AnalysisResponse {
  response?: string;
  answer?: string;
  sql_query?: string;
  visualization?: {
    type: string;
    title: string;
    data: Record<string, unknown>[];
    columns: string[];
  };
  summary?: Record<string, unknown>;
  execution_time_ms?: number;
  tokens_used?: number;
}

export interface Query {
  id: number;
  query_text: string;
  natural_language: string;
  generated_sql?: string;
  result_summary?: string;
  status: string;
  error_message?: string;
  execution_time_ms?: number;
  ai_model_used?: string;
  ai_tokens_used?: number;
  created_at: string;
  completed_at?: string;
}

export interface QueryHistory {
  queries: Query[];
  total: number;
  page: number;
  page_size: number;
}

export interface UsageStats {
  queries_today: number;
  queries_this_month: number;
  queries_limit: number;
  files_stored: number;
  files_limit: number;
  api_calls_today: number;
  api_calls_limit: number;
  storage_used_mb: number;
}

export interface APIKey {
  id: number;
  key_name: string;
  key_prefix: string;
  permissions?: string[];
  rate_limit: number;
  is_active: boolean;
  last_used?: string;
  request_count: number;
  created_at: string;
  expires_at?: string;
  api_key?: string; // Only shown once when created
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
  }

  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle file downloads
      if (options.headers && (options.headers as Record<string, string>)['Accept'] === 'application/octet-stream') {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.blob() as Promise<T>;
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }

      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<User> {
    return this.request<User>('POST', '/api/v1/auth/register', { body: JSON.stringify(data) });
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    return this.request<AuthTokens>('POST', '/api/v1/auth/login', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>('POST', '/api/v1/auth/refresh', {
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout(refreshToken: string): Promise<void> {
    await this.request<void>('POST', '/api/v1/auth/logout', {
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>('GET', '/api/v1/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('PATCH', '/api/v1/auth/me', { body: JSON.stringify(data) });
  }

  // File endpoints
  async uploadFile(file: File): Promise<DataFile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<DataFile>('POST', '/api/v1/files/upload', {
      headers: {
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
  }

  async listFiles(page = 1, pageSize = 20): Promise<FileList> {
    return this.request<FileList>(`/api/v1/files?page=${page}&page_size=${pageSize}`);
  }

  async getFile(fileId: number): Promise<DataFile> {
    return this.request<DataFile>(`/api/v1/files/${fileId}`);
  }

  async getFileData(fileId: number, limit = 100, offset = 0): Promise<{
    data: Record<string, unknown>[];
    columns: string[];
    column_types: Record<string, string>;
    total_rows: number;
  }> {
    return this.request<any>(`/api/v1/files/${fileId}/data?limit=${limit}&offset=${offset}`);
  }

  async getFileColumns(fileId: number): Promise<{ columns: any[]; row_count: number }> {
    return this.request<any>(`/api/v1/files/${fileId}/columns`);
  }

  async getFileDetails(fileId: string | number): Promise<{
    columns: string[];
    preview: Record<string, unknown>[];
    column_count: number;
    row_count: number;
  }> {
    return this.request<any>(`/api/v1/files/${fileId}/details`);
  }

  async deleteFile(fileId: number): Promise<void> {
    await this.request<void>('DELETE', `/api/v1/files/${fileId}`);
  }

  async shareFile(fileId: number): Promise<{ share_url: string; share_token: string }> {
    return this.request<any>('POST', `/api/v1/files/${fileId}/share`);
  }

  // Query endpoints
  async analyzeQuery(request: AnalysisRequest): Promise<AnalysisResponse> {
    return this.request<AnalysisResponse>('POST', '/api/v1/queries/analyze', {
      body: JSON.stringify(request),
    });
  }

  async createQuery(naturalLanguage: string, fileId: number): Promise<Query> {
    return this.request<Query>('POST', '/api/v1/queries', {
      body: JSON.stringify({
        natural_language: naturalLanguage,
        file_id: fileId,
        include_visualization: true,
      }),
    });
  }

  async getQueryHistory(page = 1, pageSize = 20, fileId?: number): Promise<QueryHistory> {
    let url = `/api/v1/queries/history?page=${page}&page_size=${pageSize}`;
    if (fileId) url += `&file_id=${fileId}`;
    return this.request<QueryHistory>(url);
  }

  async getQuery(queryId: number): Promise<Query> {
    return this.request<Query>(`/api/v1/queries/${queryId}`);
  }

  // Analytics endpoints
  async getUsageStats(): Promise<UsageStats> {
    return this.request<UsageStats>('/api/v1/analytics/usage');
  }

  // API Keys endpoints
  async createAPIKey(name: string, rateLimit = 100): Promise<APIKey> {
    return this.request<APIKey>('POST', '/api/v1/api-keys', {
      body: JSON.stringify({ name, rate_limit: rateLimit }),
    });
  }

  async listAPIKeys(): Promise<APIKey[]> {
    return this.request<APIKey[]>('GET', '/api/v1/api-keys');
  }

  async revokeAPIKey(keyId: number): Promise<void> {
    await this.request<void>('PATCH', `/api/v1/api-keys/${keyId}/revoke`);
  }

  async deleteAPIKey(keyId: number): Promise<void> {
    await this.request<void>('DELETE', `/api/v1/api-keys/${keyId}`);
  }

  // OpenAI API Key management
  async updateApiKey(apiKey: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('POST', '/api/v1/auth/api-key', {
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  async deleteApiKey(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('DELETE', '/api/v1/auth/api-key');
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    return this.request<any>('GET', '/health');
  }
}

// Export singleton instance
export const api = new ApiClient(apiConfig);

// Storage helpers
export const storage = {
  getAccessToken: () => localStorage.getItem('access_token'),
  setAccessToken: (token: string) => localStorage.setItem('access_token', token),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setRefreshToken: (token: string) => localStorage.setItem('refresh_token', token),
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  setUser: (user: User) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: (): User | null => {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  },
  clearUser: () => localStorage.removeItem('user'),
  clearAll: () => {
    storage.clearTokens();
    storage.clearUser();
  },
};

// Export types
export type {
  ApiConfig,
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  DataFile,
  FileList,
  AnalysisRequest,
  AnalysisResponse,
  Query,
  QueryHistory,
  UsageStats,
  APIKey,
};
