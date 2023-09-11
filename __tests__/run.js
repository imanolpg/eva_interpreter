const Eva = require('../Eva');
const Environment = require('../Environment');

const tests = [
  require('./self-eva-test'),
  require('./math-tests'),
  require('./variables-tests'),
  require('./block-tests'),
  require('./if-tests'),
  require('./while-test')
]

const eva = new Eva(new Environment({
  null: null,

  true: true,
  false: false,

  VERSION: '0.1'
}));

tests.forEach(test => test(eva));

console.log("All assertions passed!!");