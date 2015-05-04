import XDate from 'xdate';

const debug = require('debug')('Utils');

/**
 * Checks if code is run in a browser.
 *
 * @return {bool}
 * @public
 */
export function isClient() {
  return typeof window !== 'undefined';
}

/**
 * Checks if browser supports HTML5 history API
 *
 * @return {bool}
 * @public
 */
export function hasHTML5History() {
  return isClient() && 'history' in window;
}

/**
 * Takes a search query and returns an Object representation of it
 *
 * @param {String} Query string, without '?'
 * @return {Object} Key value pair of query string
 * @public
 */
export function parseSearchQuery(query) {
  const queries = query.split('&');
  let queryObj = {};
  queries.forEach((q) => {
    const keyValue = q.split('=');
    queryObj[keyValue[0]] = keyValue[1];

  });
  return queryObj;
}

/**
 * Reverse of parseSearchQuery, takes object, returns string.
 *
 * @param {Object} Key values must be strings
 * @return {String} String representation without '?' or trailing '&'
 * @public
 */
export function makeQueryFromObject(obj) {
  let queryString = '';
  for (let key in obj) {
    if (obj[key].hasOwnProperty) {
      queryString = `${queryString}${key}=${obj[key]}&`;
    }
  }
  queryString = queryString.slice(0, -1);
  return queryString;
}

/**
 * Insert or update query in query string
 *
 * @param {String} Key portion of query to replace or add
 * @param {String} Value of query for key to replace or add
 * @return {String} Full query string with ammendment/adjustment.
 * @public
 */
export function upsertQuery(key, value) {
  if (isClient()) {
    let query = window.location.href.split('?')[1];
    let newQuery;

    let queryObj = query ? parseSearchQuery(query) : {};

    queryObj[key] = value;

    debug(queryObj);

    newQuery = makeQueryFromObject(queryObj);

    query = `?${newQuery}`;
    return query;
  }
}

/**
 * Get human readable "time ago" string from ISO date
 *
 * @param {Date} JS date object
 * @return {String} Human readable string
 * @public
 */
export function getTimeAgo(isoDate) {
  const now = new XDate(),
    year = now.diffYears(isoDate),
    month = now.diffMonths(isoDate),
    week = now.diffWeeks(isoDate),
    day = now.diffDays(isoDate),
    hour = now.diffHours(isoDate),
    minute = now.diffMinutes(isoDate),
    second = now.diffSeconds(isoDate);

  let quantity, quantifier, plural, stop = false;

  [{year}, {month}, {week}, {day}, {hour}, {minute}, {second}]
    .forEach((valueObj) => {
      for (let key in valueObj) {
        if (valueObj[key] <= -1 && !stop) {
          quantifier = key;
          quantity = valueObj[key];
          stop = true;
        }
      }
  });

  if (quantity && quantifier) {
    quantity = Math.abs(Math.floor(quantity));
    plural = quantity === 1 ? '' : 's';
    return `about ${quantity} ${quantifier}${plural} ago.`;
  }
}

/**
 * Bind method for react ES6 classes, as they don't support auto-binding.
 * See http://www.ian-thomas.net/autobinding-react-and-es6-classes/
 * Note: Must pass class' "this" context.
 *
 * @param {String} String representing a class method on class passed from.
 * @public
 */
export function autoBind(funcString) {
  if (typeof this[funcString] !== 'function') {
    warn(
      `"%s" isn't defined in %s, can't autobind.`,
      funcString,
      this.constructor.name
    );
  } else {
    this[funcString] = this[funcString].bind(this);
  }
}

/**
 * Iterative version of autoBind for an array of strings representing functions.
 * Note: Must pass class' "this" context.
 *
 * @param {Array}
 * @public
 */
export function autoBindAll(arrayOfFuncStrings) {
  arrayOfFuncStrings.forEach((funcString) => {
    autoBind.call(this, funcString);
  });
}

export function warn(...args) {
  /*eslint-disable*/
  if (typeof window !== 'undefined' && window.console && window.console.warn) {
    window.console.warn(...args);
  } else {
    debug('Warn', ...args);
  }

  /*eslint-enable*/
}

export function error(...args) {
  /*eslint-disable*/
  if (typeof window !== 'undefined' && window.console && window.console.error) {
    window.console.error(...args);
  } else {
    debug('Error', ...args);
  }
  /*eslint-enable*/
}

export function trace(...args) {
  /*eslint-disable*/
  if (typeof window !== 'undefined' && window.console && window.console.trace) {
    window.console.trace(...args);
  } else {
    debug('Error', ...args);
  }
  /*eslint-enable*/
}
