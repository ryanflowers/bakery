import Model, { hasMany } from '@ember-data/model';

export default class CatelogModel extends Model {
  @hasMany('catelog-item') objects;
}
