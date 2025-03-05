import App from './app';

async function startApp() {
  try {
    const app = new App();
    await app.init();
  } catch (error) {
    console.error('Failed to start application:', error);
  }
}

startApp();
