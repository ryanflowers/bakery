import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AppComponent extends Component {
  @tracked selectedItems = [];

  @action
  clearSelectedItems() {
    this.selectedItems = [];
  }

  @action
  onItemClick(selectedItem) {
    if (
      selectedItem &&
      !this.selectedItems.find((item) => item.id === selectedItem.id)
    ) {
      this.selectedItems = [...this.selectedItems, selectedItem];
    }
  }
}
