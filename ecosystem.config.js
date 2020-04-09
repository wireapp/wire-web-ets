module.exports = {
  apps: [
    {
      env: {
        LOG_ERROR: `${process.env.HOME}/.pm2/logs/Wire-Web-ETS-error.log`,
        LOG_OUTPUT: `${process.env.HOME}/.pm2/logs/Wire-Web-ETS-out.log`,
        NODE_DEBUG: '@wireapp/*',
      },
      name: 'Wire Web ETS',
      script: 'dist/main.js',
    },
  ],
};
