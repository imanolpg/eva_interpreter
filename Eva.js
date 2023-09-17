const assert = require('assert');
const Environment = require('./Environment');

/**
 * Eva interpreter
 */
class Eva {

  /**
   * Creates an Eva instance with the global environment
   */
  constructor(global = GlobalEnvironment) {
    this.global = global;
  }

  /**
   * Evaluates an expression in the given environment
   * @param {*} exp expression to evaluate
   * @param {*} env variable environment
   * @returns 
   */
  eval (exp, env = this.global) {

    // --------------------------------------------
    // Self-evaluating expressions:
    if (this._isNumber(exp)) {
      return exp;
    }

    if (this._isString(exp)) {
      return exp.slice(1, -1);
    }

    // --------------------------------------------
    // Blocks:
    if (exp[0] === 'begin') {
      const blockEnv = new Environment({}, env);
      return this._evalBlock(exp, blockEnv);
    }

    // --------------------------------------------
    // Variable declaration:
    if (exp[0] === 'var') {
      const [_, name, value] = exp;
      return env.define(name, this.eval(value, env));
    }

    // --------------------------------------------
    // Variable set:
    if (exp[0] === 'set') {
      const [_, name, value] = exp;
      return env.assign(name, this.eval(value, env));
    }

    // --------------------------------------------
    // Variable access:
    if (this._isVariableName(exp)) {
      return env.lookup(exp);
    }

    // --------------------------------------------
    // If expression:
    if (exp[0] === 'if') {
      const [_tag, condition, consequent, alternate] = exp;
      if (this.eval(condition, env)) {
        return this.eval(consequent, env);
      }
      return this.eval(alternate, env);
    }

    // --------------------------------------------
    // While loop:
    if (exp[0] === 'while') {
      const [_tag, condition, body] = exp;
      let result;
      while (this.eval(condition, env)) {
        result = this.eval(body, env);
      }
      return result;
    }

    // --------------------------------------------
    // Function declaration:
    if (exp[0] === 'def') {
      const [_tag, name, params, body] = exp;

      const fn = {
        params,
        body,
        env
      };

      return env.define(name, fn);
    }

    // --------------------------------------------
    // Function calls:
    if (Array.isArray(exp)) {
      const fn = this.eval(exp[0], env);
      const args = exp.slice(1).map(arg => this.eval(arg, env));

      // 1. Native functions:
      if (typeof fn === 'function') {
        return fn(...args);
      }

      // 2. User-defined functions:
      const activationRecord = {};
      fn.params.forEach((param, index) => {
        activationRecord[param] = args[index];
      });

      const activationEnvironment = new Environment(activationRecord, fn.env);
      
      return this._evalBody(fn.body, activationEnvironment);
    }

    // --------------------------------------------
    // Unimplemented:
    throw `Unimplemented: ${JSON.stringify(exp)}`;
  }

  _evalBody(body, env) {
    if (body[0] === 'begin') {
      return this._evalBlock(body, env);
    }
    return this.eval(body, env);
  }

  _evalBlock(block, env) {
    let result;

    const [_tag, ...expressions] = block;

    expressions.forEach(exp => {
      result = this.eval(exp, env);
    });

    return result;
  }

  _isNumber(exp) {
    return typeof exp === 'number';
  }
  
  _isString(exp) {
    return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
  }
  
  _isVariableName(name) {
    return typeof name === 'string' && /^[+\-*/<>=a-zA-Z_]*[a-zA-Z0-9_]*$/.test(name);
  }
}

/**
 * Default Global Environment
 */
const GlobalEnvironment = new Environment({
  null: null,

  true: true,
  false: false,

  VERSION: '0.1',

  // Operators
  '+'(op1, op2) {
    return op1 + op2;
  },

  '-'(op1, op2 = null) {
    if (op2) 
      return op1 - op2;
    return -op1;
  },

  '*'(op1, op2) {
    return op1 * op2;
  },

  '/'(op1, op2) {
    return op1 / op2;
  },

  // Comparison
  '<'(op1, op2) {
    return op1 < op2;
  },

  '>'(op1, op2) {
    return op1 > op2;
  },

  '<='(op1, op2) {
    return op1 <= op2;
  },

  '>='(op1, op2) {
    return op1 >= op2;
  },

  '='(op1, op2) {
    return op1 === op2;
  },

  // Console output
  print(...args) {
    console.log(...args);
  }
})


module.exports = Eva;