import { SortConfig, SortField, SortOrder } from './student-sort';

/**
 * SortDropdownHandler class manages the sorting dropdown functionality.
 * It handles user interactions with the dropdown and updates the sorting configuration.
 */
export class SortDropdownHandler {
  private dropdownButton: HTMLElement;
  private dropdownMenu: HTMLElement;
  private dropdownItems: NodeListOf<HTMLElement>;
  private activeItem: HTMLElement | null = null;

  /**
   * Initializes the SortDropdownHandler with the provided callback and initial sort configuration.
   * @param onSortChange - Callback function to handle sort changes.
   * @param initialConfig - Initial sort configuration.
   */
  constructor(
    private onSortChange: (field: SortField, order: SortOrder) => void,
    private initialConfig: SortConfig = { field: 'name', order: 'asc' },
  ) {
    this.dropdownButton = document.getElementById('sortByButton') as HTMLElement;
    this.dropdownMenu = document.getElementById('sortDropdownMenu') as HTMLElement;
    this.dropdownItems = document.querySelectorAll('.sort-dropdown__item');
    this.init();
  }

  /**
   * Initializes the dropdown by setting up event listeners and setting the initial active item.
   */
  private init(): void {
    // Init dropdown toggle
    this.dropdownButton.addEventListener('click', () => {
      this.toggleDropdown();
    });
    //Close  the dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (
        !this.dropdownButton.contains(event.target as Node) &&
        !this.dropdownMenu.contains(event.target as Node)
      ) {
        this.closeDropdown();
      }
    });
    //Attach click handlers to dropdown items
    this.dropdownItems.forEach((item) => {
      item.addEventListener('click', () => {
        const field = item.getAttribute('data-field') as SortField;
        const order = item.getAttribute('data-order') as SortOrder;

        if (field && order) {
          this.onSortChange(field, order);
          this.updateActiveItem(item);
          this.updateButtonText(item.textContent || '');
          this.closeDropdown();
        }
      });
    });

    //Set initial active item
    this.setInitialActiveItem();
  }

  /**
   * Sets the initial active item based on the initial sort configuration.
   */
  private setInitialActiveItem(): void {
    const { field, order } = this.initialConfig;
    const initialItem = Array.from(this.dropdownItems).find(
      (item) =>
        item.getAttribute('data-field') === field && item.getAttribute('data-order') === order,
    );
    if (initialItem) {
      this.updateActiveItem(initialItem);
      this.updateButtonText(initialItem.textContent || '');
    } else {
      // Default to first item if no match
      const firstItem = this.dropdownItems[0];
      this.updateActiveItem(firstItem);
      this.updateButtonText(firstItem.textContent || '');
    }
  }

  /**
   * Toggles the visibility of the dropdown menu.
   */
  private toggleDropdown(): void {
    this.dropdownMenu.classList.toggle('hidden');
  }

  /**
   * Closes the dropdown menu.
   */
  private closeDropdown(): void {
    this.dropdownMenu.classList.add('hidden');
  }

  /**
   * Updates the active item in the dropdown menu.
   * @param item - The new active item.
   */
  private updateActiveItem(item: HTMLElement): void {
    //Remove active class from previous item
    if (this.activeItem) {
      this.activeItem.classList.remove('active');
    }

    // Add active class to new item

    item.classList.add('active');
    this.activeItem = item;
  }

  /**
   * Updates the text of the dropdown button to match the selected sort option.
   * @param text - The text to display on the dropdown button.
   */
  private updateButtonText(text: string): void {
    const buttonText = document.createElement('span');
    buttonText.textContent = text;

    // Clear button content and add new text
    this.dropdownButton.innerHTML = '';
    this.dropdownButton.appendChild(buttonText);

    const arrow = document.createElement('span');
    arrow.className = 'arrow-down';
    arrow.textContent = '▼';
    this.dropdownButton.appendChild(arrow);
  }

  /**
   * Updates the UI to match the current sort configuration.
   * @param config - The current sort configuration.
   */
  public updateSortUI(config: SortConfig): void {
    const { field, order } = config;
    const matchingItem = Array.from(this.dropdownItems).find(
      (item) =>
        item.getAttribute('data-field') === field && item.getAttribute('data-order') === order,
    );
    if (matchingItem) {
      this.updateActiveItem(matchingItem);
      this.updateButtonText(matchingItem.textContent || '');
    }
  }
}
