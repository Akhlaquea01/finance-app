import { axios } from "./axios";
import dayjs from 'dayjs';
import { cache } from "@/app/lib/cache";
import { sessionCache } from "@/app/lib/session-cache";

// API Endpoints Configuration
const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    LOGOUT: '/users/logout',
    CURRENT_USER: '/users/current-user',
    ALL_USERS: '/users/all-user',
  },
  
  // Accounts
  ACCOUNTS: {
    CREATE: '/account/create',
    GET: '/account/get',
    UPDATE: (id: string) => `/account/${id}`,
    DELETE: (id: string) => `/account/${id}`,
    SUMMARY: '/account/transaction/summary',
  },
  
  // Transactions
  TRANSACTIONS: {
    CREATE: '/account/transaction',
    GET_ALL: '/account/transaction',
    INCOME_EXPENSE: '/account/transaction/incomeExpenseSummary',
  },
  
  // Transfers
  TRANSFERS: {
    CREATE: '/account/transfer',
  },
  
  // Categories
  CATEGORIES: {
    CREATE: '/categories/create',
    GET_ALL: '/categories/getAll',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },
  
  // AI
  AI: {
    SUGGESTIONS: '/ai/smart-suggestions',
  },
};

// Utility function for date formatting
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('DD/MM/YYYY');
};

// Cache keys
const CACHE_KEYS = {
  ACCOUNTS: 'finance_accounts',
  SUMMARY: 'finance_summary',
  CATEGORIES: 'finance_categories',
  INCOME_EXPENSE: 'finance_income_expense',
};

// API Service Class
class ApiService {
  // Authentication Methods
  async login(payload: { email: string; password: string }) {
    return await axios.post(API_ENDPOINTS.AUTH.LOGIN, payload);
  }

  async register(formData: FormData) {
    return await axios.post(API_ENDPOINTS.AUTH.REGISTER, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async logout() {
    return await axios.get(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async getCurrentUser() {
    return await axios.get(API_ENDPOINTS.AUTH.CURRENT_USER);
  }

  async getAllUsers() {
    return await axios.get(API_ENDPOINTS.AUTH.ALL_USERS);
  }

  // Account Methods
  async createAccount(payload: any) {
    return await axios.post(API_ENDPOINTS.ACCOUNTS.CREATE, payload);
  }

  async getAccounts() {
    return await axios.get(API_ENDPOINTS.ACCOUNTS.GET);
  }

  async updateAccount(id: string, payload: any) {
    try {
      const response = await axios.put(API_ENDPOINTS.ACCOUNTS.UPDATE(id), payload);
      
      // Clear relevant caches
      cache.remove(CACHE_KEYS.ACCOUNTS);
      cache.remove(CACHE_KEYS.SUMMARY);
      cache.remove(CACHE_KEYS.INCOME_EXPENSE);
      
      return response;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  }

  async deleteAccount(id: string) {
    return await axios.delete(API_ENDPOINTS.ACCOUNTS.DELETE(id));
  }

  async getAccountSummary(month?: number, year?: number) {
    let queryParams = '';
    if (month && year) {
      queryParams = `?month=${month}&year=${year}`;
    }
    return await axios.get(`${API_ENDPOINTS.ACCOUNTS.SUMMARY}${queryParams}`);
  }

  // Transaction Methods
  async createTransaction(payload: any) {
    return await axios.post(API_ENDPOINTS.TRANSACTIONS.CREATE, payload);
  }

  async getAllTransactions(type: string, startDate: Date, endDate: Date) {
    const transactionTypeParam = type && type !== "all" ? `transactionType=${type}&` : '';
    return await axios.get(
      `${API_ENDPOINTS.TRANSACTIONS.GET_ALL}?${transactionTypeParam}startDate=${startDate}&endDate=${endDate}`
    );
  }

  async getIncomeExpense({ filterType, date, month, year }: {
    filterType: string;
    date?: Date;
    month?: number;
    year?: number;
  }) {
    let queryParams: string;
    
    if (filterType === 'yearly') {
      queryParams = `filterType=${filterType}&year=${year}`;
    } else if (filterType === 'monthly') {
      queryParams = `filterType=${filterType}&month=${month}&year=${year}`;
    } else if (filterType === 'daily') {
      if (!date) {
        throw new Error('Date is required for daily filter type');
      }
      const formattedDate = formatDate(date.toString());
      queryParams = `filterType=${filterType}&date=${formattedDate}`;
    } else {
      queryParams = `filterType=${filterType}`;
    }
    
    return await axios.get(`${API_ENDPOINTS.TRANSACTIONS.INCOME_EXPENSE}?${queryParams}`);
  }

  // Transfer Methods
  async createTransfer(payload: any) {
    return await axios.post(API_ENDPOINTS.TRANSFERS.CREATE, payload);
  }

  // Category Methods
  async createCategory(payload: any) {
    return await axios.post(API_ENDPOINTS.CATEGORIES.CREATE, payload);
  }

  async getCategories() {
    return await axios.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
  }

  async updateCategory(id: string, payload: any) {
    return await axios.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), payload);
  }

  async deleteCategory(id: string) {
    return await axios.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  }

  // AI Methods
  async getAiSuggestions(payload: { startDate: string; endDate: string }) {
    // Check session cache first to avoid expensive AI calls
    const cacheKey = `ai_suggestions_${payload.startDate}_${payload.endDate}`;
    const cachedData = sessionCache.get(cacheKey);
    
    if (cachedData) {
      // Return cached data in the same format as API response
      return { data: cachedData };
    }
    
    // If not cached, make API call
    const response = await axios.post(API_ENDPOINTS.AI.SUGGESTIONS, payload);
    
    // Cache the response for 30 minutes (AI calls are expensive)
    if (response?.data) {
      sessionCache.set(cacheKey, response.data, 30 * 60 * 1000); // 30 minutes
    }
    
    return response;
  }

}

// Export singleton instance
export const apiService = new ApiService();

// Export individual methods for backward compatibility
export const {
  // Auth
  login: loginUser,
  register: createUser,
  logout: logoutUser,
  getCurrentUser: fetchUserDetails,
  getAllUsers: fetchAllUser,
  
  // Accounts
  createAccount,
  getAccounts: fetchAccountList,
  updateAccount,
  deleteAccount,
  getAccountSummary: fetchAccountStatsSummary,
  
  // Transactions
  createTransaction,
  getAllTransactions: fetchAllTransaction,
  getIncomeExpense: fetchIncomeExpense,
  
  // Transfers
  createTransfer,
  
  // Categories
  createCategory,
  getCategories: fetchCategory,
  updateCategory,
  deleteCategory,
  
  // AI
  getAiSuggestions: fetchAiSuggestion,
} = apiService;
