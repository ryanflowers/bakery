import Route from '@ember/routing/route';
import { task } from 'ember-concurrency';

const getCatelog = () => fetch('/api/catelog').then((res) => res.json());

// export default class IndexRoute extends Route {
//   model() {
//     const load = task(function* () {
//       const result = yield getCatelog();
//       return { items: JSON.parse(result.message).objects };
//     });

//     return { catelog: load.perform() };
//   }
// }

export default Route.extend({
  model: function () {
    return {
      catelog: this.get('catelogTask').perform(),
    };
  },
  catelogTask: task(function* () {
    const result = yield getCatelog();
    return { items: JSON.parse(result.message).objects };
  }),
});
