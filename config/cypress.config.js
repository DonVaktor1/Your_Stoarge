import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Функція для реєстрації подій, які можуть оброблятися в тестах.
    setupNodeEvents(on, config) {
      // Приклад використання події для обробки скріншотів при помилках.
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
      });

      on('after:screenshot', (details) => {
        console.log('Screenshot taken:', details);
      });

      // Поверни змінений конфіг, якщо потрібно.
      return config;
    },

    // Базовий URL для запуску тестів.
    baseUrl: 'http://localhost:3000', 

    // Шаблон для пошуку тестових файлів.
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Таймаут для очікування завантаження сторінок (у мілісекундах).
    pageLoadTimeout: 60000,

    // Таймаут для команд Cypress.
    defaultCommandTimeout: 10000,

    // Увімкнення автоматичного повторення тестів при падінні.
    retries: {
      runMode: 2, // Повторює тести 2 рази в режимі запуску.
      openMode: 0, // Не повторює в інтерактивному режимі.
    },

    // Налаштування скріншотів та відеозапису.
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true, // Запис відео з тестів.
    videoCompression: 32, // Зменшення розміру відео (за замовчуванням 32).
  },
});
