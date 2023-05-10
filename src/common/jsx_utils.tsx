import { Comment, h } from "vue";

export function not_undefined_or<T>(fn: () => any, _default?: T) {
  const result = fn();
  if (result !== undefined) {
    return result;
  }
  if (_default === undefined) {
    return h(Comment, '')
  } 
  return _default
}

export function tpl<const T extends any[]>(...el: T) {
  return <>{el}</>
}
