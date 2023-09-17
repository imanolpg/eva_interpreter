const Eva = require('../Eva');

const tests = [
  require('./self-eva-test'),
  require('./math-tests'),
  require('./variables-tests'),
  require('./block-tests'),
  require('./if-tests'),
  require('./while-test'),
  require('./built-in-function-test')
]

const eva = new Eva();

tests.forEach(test => test(eva));

eva.eval(['print', '"Hello"', '" "', '"world!"']);

console.log("All assertions passed!!");