const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  node: {
    crypto: true,
    http: true,
    https: true,
    os: true,
    vm: true,
    stream: true
  },
  resolve: {
    alias: {
      "crypto": "crypto-browserify"
    }
  }
  /*plugins: [
    new CopyPlugin([
        {
          from: path.join(__dirname, 'node_modules/mokka/dist/web/bundle.js'),
          to: path.join(__dirname, 'src/assets/workers/bundle.js'),
          force: true
        },
        {
          'context': 'src',
          'to': '',
          'from': {
            'glob': 'src/assets/!**!/!*',
            'dot': true
          }
        },
        {
          'context': 'src',
          'to': '',
          'from': {
            'glob': 'src/favicon.ico',
            'dot': true
          }
        }
      ], {
        'ignore': [
          '.gitkeep',
          '**!/.DS_Store',
          '**!/Thumbs.db'
        ],
        'debug': 'warning'
      }
    )
  ]*/
};
