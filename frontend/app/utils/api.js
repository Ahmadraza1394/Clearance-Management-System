"use client";

/**
 * API Service for communicating with the backend
 * This service provides methods for making HTTP requests to the backend API
 * Optimized with caching to improve performance
 */

// API base URL - update this with your backend URL
const API_URL = 'http://localhost:5000/api';

// Cache for storing API responses
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache duration

/**
 * Base API service for making HTTP requests to the backend
 */
const apiService = {
  /**
   * Make a GET request with caching
   * @param {string} endpoint - API endpoint
   * @param {boolean} useCache - Whether to use cached response if available (default: true)
   * @returns {Promise} - Response data
   */
  async get(endpoint, useCache = true) {
    try {
      // Check cache first if caching is enabled
      if (useCache) {
        const cacheKey = `GET:${endpoint}`;
        const cachedData = cache.get(cacheKey);
        
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
          return cachedData.data;
        }
      }
      
      const response = await fetch(`${API_URL}${endpoint}`);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like plain text error messages)
        const text = await response.text();
        data = { message: text };
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Store in cache if caching is enabled
      if (useCache) {
        const cacheKey = `GET:${endpoint}`;
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {boolean} invalidateCache - Whether to invalidate related cache entries (default: true)
   * @returns {Promise} - Response data
   */
  async post(endpoint, body, invalidateCache = true) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like plain text error messages)
        const text = await response.text();
        data = { message: text };
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Invalidate related cache entries if needed
      if (invalidateCache) {
        this.invalidateRelatedCache(endpoint);
      }
      
      return data;
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {boolean} invalidateCache - Whether to invalidate related cache entries (default: true)
   * @returns {Promise} - Response data
   */
  async put(endpoint, body, invalidateCache = true) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like plain text error messages)
        const text = await response.text();
        data = { message: text };
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Invalidate related cache entries if needed
      if (invalidateCache) {
        this.invalidateRelatedCache(endpoint);
      }
      
      return data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {boolean} invalidateCache - Whether to invalidate related cache entries (default: true)
   * @returns {Promise} - Response data
   */
  async delete(endpoint, invalidateCache = true) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses (like plain text error messages)
        const text = await response.text();
        data = { message: text };
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Invalidate related cache entries if needed
      if (invalidateCache) {
        this.invalidateRelatedCache(endpoint);
      }
      
      return data;
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Invalidate cache entries related to the given endpoint
   * @param {string} endpoint - The endpoint that was modified
   */
  invalidateRelatedCache(endpoint) {
    // Extract the base resource from the endpoint (e.g., /students/123 -> /students)
    const parts = endpoint.split('/');
    const baseResource = parts.length > 1 ? `/${parts[1]}` : endpoint;
    
    // Invalidate all cache entries related to this resource
    for (const key of cache.keys()) {
      if (key.includes(baseResource)) {
        cache.delete(key);
      }
    }
  },
  
  /**
   * Clear the entire cache
   */
  clearCache() {
    cache.clear();
  }
};

export default apiService;
