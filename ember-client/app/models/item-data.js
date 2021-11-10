import Model, { attr, hasMany } from '@ember-data/model';

export default class ItemDataModel extends Model {
  @attr('string') description;
  @attr('string') name;
  @hasMany('variations') variations;
}
