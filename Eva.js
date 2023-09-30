const assert = require('assert');
const Environment = require('./Environment');
const Transformer = require('./transform/Transformer');

/**
 * Eva interpreter
 */
class Eva {

  /**
   * Creates an Eva instance with the global environment
   */
  constructor(global = GlobalEnvironment) {
    this.global = global;
    this._transformer = new Transformer();
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
      const [_, ref, value] = exp;

      if (ref[0] === 'prop') {
        const[ _tag, instance, propName] = ref;
        const instanceEnv = this.eval(instance, env);

        return instanceEnv.define(
          propName,
          this.eval(value, env)
        );
      }

      return env.assign(ref, this.eval(value, env));
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
      // JIT-transpile toa variable declaration
      const varExp = this._transformer.transformDefToVarLambda(exp);

      return this.eval(varExp, env);
    }

    // --------------------------------------------
    // Switch expression:
    if (exp[0] === 'switch') {
      const ifExp = this._transformer.transformSwitchToIf(exp);
      return this.eval(ifExp, env);
    }

    // --------------------------------------------
    // For loop:
    if (exp[0] === 'for') {
      const whileExp = this._transformer.transformForToWhile(exp);
      return this.eval(whileExp, env);
    }

    // --------------------------------------------
    // ++ operator:
    if (exp[0] === '++') {
      const setExp = this._transformer.transformIncToSet(exp);
      return this.eval(setExp, env);
    }

    // --------------------------------------------
    // Lambda functions
    if (exp[0] === 'lambda') {
      const [_tag, params, body] = exp;

      return {
        params,
        body,
        env
      }
    }

    // --------------------------------------------
    // Class declaration:
    if (exp[0] === 'class') {
      const [_tag, name, parent, body] = exp;

      // get a parent environment for inheritance 
      const parentEnv = this.eval(parent, env) || env;

      // create the new class with the corresponding parent env
      const classEnv = new Environment({}, parentEnv);
      this._evalBody(body, classEnv);
      
      return env.define(name, classEnv);
    }

    // --------------------------------------------
    // Class instantiation:
    if (exp[0] === 'new') {

      const classEnv = this.eval(exp[1], env);

      // an instance of a class is an environment
      const instanceEnv = new Environment({}, classEnv);

      const args = exp.slice(2).map(arg => this.eval(arg, env));

      this._callUserDefinedFunction(classEnv.lookup('constructor'),
        [instanceEnv, ...args]);

      return instanceEnv;
    }

    // --------------------------------------------
    // Property access:
    if (exp[0] === 'prop') {
      const [_tag, instance, name] = exp;
      const instanceEnv = this.eval(instance, env);
      return instanceEnv.lookup(name);
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
      return this._callUserDefinedFunction(fn, args);
    }

    // --------------------------------------------
    // Unimplemented:
    throw `Unimplemented: ${JSON.stringify(exp)}`;
  }

  _callUserDefinedFunction(fn, args) {
    const activationRecord = {};
    fn.params.forEach((param, index) => {
      activationRecord[param] = args[index];
    });

    const activationEnvironment = new Environment(activationRecord, fn.env);
    
    return this._evalBody(fn.body, activationEnvironment);
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