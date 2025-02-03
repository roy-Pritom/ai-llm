module.exports = {
    apps: [
      {
        script: './dist/server.js',
        watch: false,
        exec_mode: 'cluster',
        name: 'wevloperclothing-server',
        cwd: '/root/wevloperclothing-server',
        instances: '1',
        // max_memory_restart: '300M',
        autorestart: true,
        env: {
          NODE_ENV: 'production',
          PORT: 8005,
        },
      },
    ],
  };