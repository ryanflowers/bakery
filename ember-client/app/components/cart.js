import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { createOrder } from './Order';

export default class CartComponent extends Component {
  @tracked
  order = null;

  @action
  async onCheckout() {
    const result = await createOrder(this.args.items);
    this.args.onCheckout();
    this.order = result.order;
  }
}
