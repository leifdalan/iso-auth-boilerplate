import XDate from 'xdate';

const debug = require('debug')('Utils');


export function isClient() {
  return typeof window !== 'undefined';
};

export function hasHTML5History() {
  return isClient() && 'history' in window;
};


export function parseSearchQuery(query) {
  const queries = query.split('&');
  let queryObj = {};
  queries.forEach((q, i) => {
    const keyValue = q.split('=');
    queryObj[keyValue[0]] = keyValue[1];

  });
  return queryObj;
}

export function makeQueryFromObject(obj) {
  let queryString = '';
  for (let key in obj) {
    queryString = `${queryString}${key}=${obj[key]}&`;
  }
  queryString = queryString.slice(0, -1);
  return queryString;
}

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

export function getTimeAgo(isoDate) {
  const now = new XDate(),
    date = new XDate(isoDate),
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
    plural = quantity === 1? '' : 's';
    return `about ${quantity} ${quantifier}${plural} ago.`
  }
}
