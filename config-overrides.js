// config-overrides.js

const multipleEntry = require('react-app-rewire-multiple-entry')([
  {
    entry: 'src/index.tsx',
    outPath: 'popup.html'
  },
  {
    entry: 'src/options/index.tsx',
    outPath: 'options.html'
  }
]);

module.exports = {
  webpack: function(config, env) {
    multipleEntry.addMultiEntry(config);
    return config;
  }
};
