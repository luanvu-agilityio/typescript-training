import { loadingTemplate } from '../templates/loading-spinner';

export class LoadingSpinner {
  private static instance: LoadingSpinner | null = null;
  private loadingContainer: HTMLElement | null = null;
  private loadingCount = 0;
  private lastShowTime = Date.now();
  private readonly MINIMUM_DISPLAY_TIME = 1000;

  private constructor() {
    this.initializeLoadingContainer();
  }

  public static getInstance(): LoadingSpinner {
    if (!LoadingSpinner.instance) {
      LoadingSpinner.instance = new LoadingSpinner();
    }
    return LoadingSpinner.instance;
  }

  private initializeLoadingContainer(): void {
    const existingContainer = document.getElementById('loadingContainer');

    if (!existingContainer) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = loadingTemplate();

      const spinnerElement = tempDiv.firstElementChild;
      if (spinnerElement) {
        document.body.appendChild(spinnerElement);
      }
    }

    this.loadingContainer = document.getElementById('loadingContainer');
  }

  public show(): void {
    this.loadingCount++;
    if (this.loadingContainer && this.loadingCount > 0) {
      this.lastShowTime = Date.now();
      this.loadingContainer.style.display = 'flex';
    }
  }

  public hide(): void {
    // decrease the loading count by 1 but still have to make sure it > 0
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    // The loading container doesn't exist or there are still active loading operations
    if (!this.loadingContainer || this.loadingCount !== 0) return;

    const timeSinceShow = Date.now() - this.lastShowTime;
    // delay hide() if the spinner has been shown less than minimum required time
    if (timeSinceShow < this.MINIMUM_DISPLAY_TIME) {
      setTimeout(() => {
        if (this.loadingCount === 0) {
          this.loadingContainer!.style.display = 'none';
        }
      }, this.MINIMUM_DISPLAY_TIME - timeSinceShow);
    } else {
      this.loadingContainer.style.display = 'none';
    }
  }
}
