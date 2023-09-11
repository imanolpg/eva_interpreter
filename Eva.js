const assert = require('assert');

/**
 * Eva interpreter
 */
class Eva {
  eval (exp) {
    if (isNumber(exp)) {
      return exp;
    }

    if (isString(exp)) {
      return exp.slice(1, -1);
    }

    if (exp[0] === '+') {
      var fexp = exp[1];
      var sexp = exp[2];
      if (isArray(exp[1])) {
        fexp = this.eval(fexp);
      }
      if (isArray(sexp)) {
        sexp = this.eval(sexp);
      }
      return fexp + sexp;
    }

    throw 'Unimplemented';
  }
}

function isNumber(exp) {
  return typeof exp === 'number';
}

function isString(exp) {
  return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
}

function isArray(exp) {
  return exp instanceof Array;
}

// -------------------------------
// Tests:
const eva = new Eva();
assert.strictEqual(eva.eval(1), 1);
assert.strictEqual(eva.eval('"hello"'), "hello");

assert.strictEqual(eva.eval(['+', 1, 5]), 6);
assert.strictEqual(eva.eval(['+', ['+', 3, 2], 5]), 10);

console.log("All assertions passed!!");