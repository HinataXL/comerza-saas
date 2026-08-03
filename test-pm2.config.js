module.exports = {
  apps: [{
    name: 'test',
    script: 'node',
    args: '-e "console.log(process.env.PORT)"',
    env: { PORT: 3001 }
  }]
};
