import { ToastHandler } from './toast-handler';

/**
 * Pagination class manages pagination for a list of items on a web page.
 * It provides methods to navigate through pages, update the UI, and handle user interactions.
 */

export class Pagination {
  private element: HTMLElement;
  private itemsPerPageSelect: HTMLSelectElement;
  private firstBtn: HTMLButtonElement;
  private prevBtn: HTMLButtonElement;
  private nextBtn: HTMLButtonElement;
  private lastBtn: HTMLButtonElement;
  private pageInfo: HTMLSpanElement;
  private goToInput: HTMLInputElement;
  private goBtn: HTMLButtonElement;
  private pageNumbersContainer: HTMLDivElement;

  private totalItems: number = 0;
  private itemsPerPage: number = 5;
  private currentPage: number = 1;
  private totalPages: number = 1;

  /**
   * Initializes the Pagination instance with the container selector and callback function.
   * @param containerSelector - The CSS selector for the pagination container element.
   * @param callback - The callback function to be called when the page or items per page changes.
   */ private callback: (page: number, itemsPerPage: number) => void;

  constructor(containerSelector: string, callback: (page: number, itemsPerPage: number) => void) {
    this.element = document.querySelector(containerSelector) as HTMLElement;
    if (!this.element) {
      throw new Error(`Container element not found: ${containerSelector}`);
    }
    this.callback = callback;

    // Initialize UI elements
    this.itemsPerPageSelect = this.element.querySelector(
      '.pagination__select',
    ) as HTMLSelectElement;
    this.firstBtn = this.element.querySelector('.pagination__button--first') as HTMLButtonElement;
    this.prevBtn = this.element.querySelector('.pagination__button--prev') as HTMLButtonElement;
    this.nextBtn = this.element.querySelector('.pagination__button--next') as HTMLButtonElement;
    this.lastBtn = this.element.querySelector('.pagination__button--last') as HTMLButtonElement;
    this.pageInfo = this.element.querySelector('.pagination__info') as HTMLSpanElement;
    this.goToInput = this.element.querySelector('.pagination__input') as HTMLInputElement;
    this.goBtn = this.element.querySelector('.pagination__button--go') as HTMLButtonElement;

    // For page number between prev and next buttons
    const pageIndicator = this.element.querySelector(
      '.pagination__page-indicator',
    ) as HTMLDivElement;
    this.pageNumbersContainer = document.createElement('div');
    this.pageNumbersContainer.className = 'pagination__page-numbers';
    pageIndicator.appendChild(this.pageNumbersContainer);

    this.bindEvents();
  }

  /**
   * Binds event listeners to the pagination controls.
   */
  private bindEvents(): void {
    this.itemsPerPageSelect.addEventListener('change', () => {
      this.itemsPerPage = parseInt(this.itemsPerPageSelect.value);
      this.calculateTotalPages();
      this.currentPage = 1;
      this.updateUI();
      this.triggerCallback();
    });

    this.firstBtn.addEventListener('click', () => {
      if (this.currentPage !== 1) {
        this.currentPage = 1;
        this.updateUI();
        this.triggerCallback();
      }
    });

    this.prevBtn.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.updateUI();
        this.triggerCallback();
      }
    });

    this.nextBtn.addEventListener('click', () => {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.updateUI();
        this.triggerCallback();
      }
    });

    this.lastBtn.addEventListener('click', () => {
      if (this.currentPage !== this.totalPages) {
        this.currentPage = this.totalPages;
        this.updateUI();
        this.triggerCallback();
      }
    });

    this.goBtn.addEventListener('click', () => {
      const page = parseInt(this.goToInput.value);
      if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.updateUI();
        this.triggerCallback();
      } else {
        // Reset input to current page
        this.goToInput.value = this.currentPage.toString();
      }
    });
    this.goToInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.goBtn.click();
      }
    });
  }

  /**
   * Updates the total number of items and recalculates the total pages.
   * @param totalItems - The total number of items.
   */
  public updateTotalItems(totalItems: number): void {
    this.totalItems = totalItems;
    this.calculateTotalPages();
    this.updateUI();
  }

  /**
   * Calculates the total number of pages based on the total items and items per page.
   */
  private calculateTotalPages(): void {
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  /**
   * Updates the state of the pagination controls and displays the current range of items.
   */
  private updateUI(): void {
    //update buttons state
    this.firstBtn.disabled = this.currentPage === 1;
    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === this.totalPages;
    this.lastBtn.disabled = this.currentPage === this.totalPages;

    //Update page info
    const startItem = Math.min((this.currentPage - 1) * this.itemsPerPage + 1, this.totalItems);
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    this.pageInfo.textContent = `Showing ${startItem} to ${endItem} of ${this.totalItems} students`;

    //update go to input
    this.goToInput.value = this.currentPage.toString();
    this.goToInput.max = this.totalPages.toString();
    // render page number
    this.renderPageNumbers();
  }

  /**
   * Renders the page numbers with ellipses for large ranges.
   */
  private renderPageNumbers(): void {
    this.pageNumbersContainer.innerHTML = '';

    //Displaying page numbers with ellipses
    const maxPagesToShow = 3;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    //Adjust start page if end page at maximum
    if (endPage === this.totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    //Always show first page
    if (startPage > 1) {
      this.addPageNumber(1);
      // Add ellipsis if there is a gap
      if (startPage > 2) {
        this.addEllipsis();
      }
    }

    //Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      this.addPageNumber(i);
    }

    //Always show last page
    if (endPage < this.totalPages) {
      // Add ellipsis if there is a gap
      if (endPage < this.totalPages - 1) {
        this.addEllipsis();
      }
      this.addPageNumber(this.totalPages);
    }
  }

  /**
   * Adds a page number button to the page numbers container.
   * @param pageNum - The page number to add.
   */
  private addPageNumber(pageNum: number): void {
    const pageButton = document.createElement('button');
    pageButton.className = `pagination__button pagination__button--number ${
      pageNum === this.currentPage ? 'pagination__button--active' : ''
    }`;
    pageButton.textContent = pageNum.toString();
    pageButton.addEventListener('click', () => {
      if (pageNum !== this.currentPage) {
        this.currentPage = pageNum;
        this.updateUI();
        this.triggerCallback();
      }
    });
    this.pageNumbersContainer.appendChild(pageButton);
  }

  /**
   * Adds an ellipsis to the page numbers container.
   */
  private addEllipsis(): void {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'pagination__ellipsis';
    ellipsis.textContent = '...';
    this.pageNumbersContainer.appendChild(ellipsis);
  }

  /**
   * Calls the callback function with the current page and items per page.
   */
  private triggerCallback(): void {
    this.callback(this.currentPage, this.itemsPerPage);
  }
}
