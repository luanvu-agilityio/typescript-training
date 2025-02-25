import App from './app';

async function startApp() {
  try {
    const app = new App();
    await app.init();
    console.log('Application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
    // Could add fallback UI or retry logic here
  }
}

startApp();
