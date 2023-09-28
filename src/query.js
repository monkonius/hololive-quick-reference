export function createQuery(parameters) {
  let query = 'https://virtualyoutuber.fandom.com/api.php';
  query += '?origin=*';
  Object.keys(parameters).forEach(key => {
    query += '&' + key + '=' + parameters[key];
  });
  query += '&format=json';

  return query;
}