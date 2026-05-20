/**
 * PM2 Ecosystem
 * Purpose: Run the backend API in production cluster mode.
 */
export default {
  apps: [{
    name: 'backend-app',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
  }],
};
