import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });

      on('after:screenshot', (details) => {
        console.log('Screenshot taken:', details);
      });
      return config;
    },
    baseUrl: 'http://localhost:3000', 
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    pageLoadTimeout: 60000,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2, 
      openMode: 0, 
    },
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    videoCompression: 32,
    
    // Додати розмір вікна
    viewportWidth: 1280, // ширина вікна
    viewportHeight: 720, // висота вікна
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack', 
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}', 
    defaultCommandTimeout: 8000,

    // Додати розмір вікна
    viewportWidth: 1280, // ширина вікна
    viewportHeight: 720, // висота вікна
  },
});
