import Model, { attr } from '@ember-data/model';

export default class CatelogItemModel extends Model {
  @attr('string') type;
  @attr('string') id;
  @attr('item-data') item_data;
}
