import Model, { attr } from '@ember-data/model';

export default class PriceModel extends Model {
  @attr('string') amount;
  @attr('string') currency;
}
