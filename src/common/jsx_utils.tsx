export function not_undefined_or<T>(fn: () => any, _default?: T) {
  const result = fn();
  if (result !== undefined) {
    return result;
  }
  if (_default === undefined) {
    return <div></div>
  } 
  return _default
}
