module.exports = {
  apps: [
    {
      name: 'comerza-api',
      script: 'npm',
      args: 'run start',
      cwd: './apps/api',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'comerza-web',
      script: 'npm',
      args: 'run start',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
