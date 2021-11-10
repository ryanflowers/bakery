import Model, { attr } from '@ember-data/model';

export default class ItemVariationDataModel extends Model {
  @attr('string') item_id;
  @attr('string') name;
  @atrr('price') price_money;
}
