import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@padel/auth_token',
  USER_DATA: '@padel/user_data',
  PENDING_RESULTS: '@padel/pending_results',
} as const;

export const storage = {
  // Auth token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // User data
  async getUserData(): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async setUserData(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  },

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  // Pending results (offline support)
  async getPendingResults(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_RESULTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting pending results:', error);
      return [];
    }
  },

  async addPendingResult(result: any): Promise<void> {
    try {
      const pending = await this.getPendingResults();
      pending.push({ ...result, timestamp: Date.now() });
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_RESULTS,
        JSON.stringify(pending)
      );
    } catch (error) {
      console.error('Error adding pending result:', error);
    }
  },

  async removePendingResult(index: number): Promise<void> {
    try {
      const pending = await this.getPendingResults();
      pending.splice(index, 1);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_RESULTS,
        JSON.stringify(pending)
      );
    } catch (error) {
      console.error('Error removing pending result:', error);
    }
  },

  async clearPendingResults(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_RESULTS);
    } catch (error) {
      console.error('Error clearing pending results:', error);
    }
  },

  // Clear all storage
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.PENDING_RESULTS,
      ]);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
