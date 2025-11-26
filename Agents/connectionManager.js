const { Pool } = require('pg');
const Redis = require('redis');
const axios = require('axios');
const https = require('https');
const http = require('http');

class ConnectionManager {
  constructor() {
    this.dbPool = null;
    this.redisClient = null;
    this.httpAgent = null;
    this.httpsAgent = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // PostgreSQL Connection Pool
      this.dbPool = new Pool({
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        // Connection Pool Configuration
        min: 2,                    // Minimum connections
        max: 20,                   // Maximum connections
        idleTimeoutMillis: 30000,  // Close idle connections after 30s
        connectionTimeoutMillis: 5000, // Connection timeout
        acquireTimeoutMillis: 60000,   // Pool acquire timeout
        createTimeoutMillis: 3000,     // Create connection timeout
        destroyTimeoutMillis: 5000,    // Destroy connection timeout
        reapIntervalMillis: 1000,      // Cleanup interval
        createRetryIntervalMillis: 200, // Retry interval
        propagateCreateError: false     // Don't crash on connection errors
      });

      // Redis Connection Pool (only if enabled)
      if (process.env.REDIS_ENABLED === 'true') {
        this.redisClient = Redis.createClient({
          url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
          socket: {
            connectTimeout: 5000,
            lazyConnect: true,
            keepAlive: 30000,
            noDelay: true
          },
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              return new Error('Redis server connection refused');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              return new Error('Redis retry time exhausted');
            }
            if (options.attempt > 10) {
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });
      }

      // HTTP/HTTPS Connection Agents for external APIs
      this.httpAgent = new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
        socketActiveTTL: 110000
      });

      this.httpsAgent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 50,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
        socketActiveTTL: 110000
      });

      // Configure Axios with connection pooling
      axios.defaults.httpAgent = this.httpAgent;
      axios.defaults.httpsAgent = this.httpsAgent;
      axios.defaults.timeout = 30000;

      // Test connections
      await this.testConnections();
      
      this.initialized = true;
      console.log('🔗 Connection Manager initialized with pooling');
      
    } catch (error) {
      console.error('❌ Connection Manager initialization failed:', error);
      throw error;
    }
  }

  async testConnections() {
    // Test PostgreSQL
    try {
      const client = await this.dbPool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ PostgreSQL pool connection test passed');
    } catch (error) {
      console.warn('⚠️ PostgreSQL pool test failed:', error.message);
    }

    // Test Redis (only if enabled)
    if (process.env.REDIS_ENABLED === 'true' && this.redisClient) {
      try {
        await this.redisClient.connect();
        await this.redisClient.ping();
        console.log('✅ Redis connection test passed');
      } catch (error) {
        console.warn('⚠️ Redis connection test failed:', error.message);
      }
    }
  }

  getDbPool() {
    if (!this.initialized) {
      throw new Error('Connection Manager not initialized');
    }
    return this.dbPool;
  }

  getRedisClient() {
    if (!this.initialized) {
      throw new Error('Connection Manager not initialized');
    }
    if (process.env.REDIS_ENABLED !== 'true') {
      return null;
    }
    return this.redisClient;
  }

  getPoolStats() {
    if (!this.dbPool) return null;
    
    return {
      totalConnections: this.dbPool.totalCount,
      idleConnections: this.dbPool.idleCount,
      waitingRequests: this.dbPool.waitingCount,
      maxConnections: this.dbPool.options.max,
      minConnections: this.dbPool.options.min
    };
  }

  async gracefulShutdown() {
    console.log('🔄 Gracefully shutting down connections...');
    
    if (this.dbPool) {
      await this.dbPool.end();
      console.log('✅ PostgreSQL pool closed');
    }
    
    if (this.redisClient && process.env.REDIS_ENABLED === 'true') {
      await this.redisClient.quit();
      console.log('✅ Redis connection closed');
    }
    
    if (this.httpAgent) {
      this.httpAgent.destroy();
      console.log('✅ HTTP agent destroyed');
    }
    
    if (this.httpsAgent) {
      this.httpsAgent.destroy();
      console.log('✅ HTTPS agent destroyed');
    }
  }
}

// Singleton instance
const connectionManager = new ConnectionManager();

module.exports = connectionManager;