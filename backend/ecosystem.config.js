module.exports = {
  apps: [{
    name: 'pixematch-backend',
    script: './index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
