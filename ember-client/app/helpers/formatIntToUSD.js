import { helper } from '@ember/component/helper';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatIntToUSD = ([num]) => formatter.format(num / 100);

export default helper(formatIntToUSD);
