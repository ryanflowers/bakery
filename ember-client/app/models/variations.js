import Model, { attr } from '@ember-data/model';

export default class VariationsModel extends Model {
  @attr('string') id;
  @attr('string') type;
  @attr('item-variation') item_variation_data;
}
