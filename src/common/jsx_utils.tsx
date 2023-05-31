import { Comment, Slots, h } from "vue";
import { Maybe } from "./utils";

export function not_undefined_or<T>(fn: () => any, _default?: T) {
  const result = fn();
  if (result !== undefined) {
    return result;
  }
  if (_default === undefined) {
    return h(Comment, "");
  }
  return _default;
}

export function tpl<const T extends any[]>(...el: T) {
  return <>{el}</>;
}

export function insert_slot(slot: Readonly<Slots>, name: string = "default") {
  return Maybe.of(slot[name])
    .map((it) => it())
    .unwrap_or(h(Comment, ""));
}
