const CracoLessPlugin = require('craco-less');
const { theme } = require('./src/config/theme/themeVariables');


module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          path: false,
        },
      },
      ignoreWarnings: [/Failed to parse source map/],
    },
    test: /\.m?jsx?$/,
    // exclude: /node_modules\/@firebase/,
    exclude: /node_modules\/@firebase\/auth/,
    ignoreWarnings: [/Failed to parse source map/],
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              ...theme,
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
