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
