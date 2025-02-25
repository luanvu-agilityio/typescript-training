import { markAsUncloneable } from 'worker_threads';
import { SortConfig, SortField, SortOrder } from './student-sort';

export class SortDropdownHandler {
  private dropdownButton: HTMLElement;
  private dropdownMenu: HTMLElement;
  private dropdownItems: NodeListOf<HTMLElement>;
  private activeItem: HTMLElement | null = null;

  constructor(
    private onSortChange: (field: SortField, order: SortOrder) => void,
    private initialConfig: SortConfig = { field: 'name', order: 'asc' },
  ) {
    this.dropdownButton = document.getElementById('sortByButton') as HTMLElement;
    this.dropdownMenu = document.getElementById('sortDropdownMenu') as HTMLElement;
    this.dropdownItems = document.querySelectorAll('.sort-dropdown__item');
    this.init();
  }

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

  private toggleDropdown(): void {
    this.dropdownMenu.classList.toggle('hidden');
  }

  private closeDropdown(): void {
    this.dropdownMenu.classList.add('hidden');
  }

  private updateActiveItem(item: HTMLElement): void {
    //Remove active class from previous item
    if (this.activeItem) {
      this.activeItem.classList.remove('active');
    }

    // Add active class to new item

    item.classList.add('active');
    this.activeItem = item;
  }

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

  // update UI to match current sort config
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
