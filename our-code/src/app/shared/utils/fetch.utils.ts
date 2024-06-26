export function fetchToJson<T>(url: string, options: Object): Promise<T> {
  return fetch(url, options).then((res) => res.json());
}
