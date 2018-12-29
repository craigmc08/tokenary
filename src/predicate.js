/**
 * @callback Predicate
 * @param {any} actual
 * @returns {boolean}
 */

 /**
  * Checks if actual is strict equal (===) to truth
  * @param {any} truth
  * @returns {Predicate}
  */
const is = truth => actual => truth === actual;
exports.is = is;

/**
 * Checks if actual is any of the values in truths
 * @param {...any} truths
 * @returns {Predicate}
 */
const isOneOf = (...truths) => actual => truths.includes(actual);
exports.isOneOf = isOneOf;

/**
 * Checks if actual matches the regular expression
 * @param {RegExp} regex 
 * @returns {Predicate}
 */
const matches = regex => actual => regex.test(actual);
exports.matches = matches;



/**
 * Logical not operator on a predicate
 * @param {Predicate} predicate
 * @returns {Predicate}
 */
const not = predicate => actual => !predicate(actual);
exports.not = not;

/**
 * Logical or operator on predicates
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
const or = (...predicates) => actual =>
    predicates.reduce((result, predicate) => result || predicate(actual), false);
exports.or = or;

/**
 * Logical nor operator on predicates. Short for not(or(...predicates))
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
const nor = (...predicates) => not(or(...predicates));
exports.nor = nor;

/**
 * Logical and operator on predicates
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
const and = (...predicates) => actual =>
    predicates.reduce((result, predicate) => result && predicate(actual), true);
exports.and = and;

/**
 * Logical nand operator on predicates. Short for not(and(...predicates))
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
const nand = (...predicates) => not(and(...predicates));
exports.nand = nand;

/**
 * Logical xor operator on 2 predicates
 * @param {Predicate} predicate1
 * @param {Predicate} predicate2
 * @returns {Predicate}
 */
const xor = (predicate1, predicate2) =>
    and(nand(predicate1, predicate2), or(predicate1, predicate2))
exports.xor = xor;