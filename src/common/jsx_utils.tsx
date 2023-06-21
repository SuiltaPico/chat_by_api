import {
  Comment,
  Slots,
  VNode,
  createCommentVNode,
  createTextVNode,
  h,
} from "vue";
import { Maybe, Nil } from "./utils";
import { isArray, isNil } from "lodash";

export function vif(cond: boolean, template: VNode) {
  if (cond) return template;

  return createCommentVNode();
}

export function vif_fn(cond: boolean, template: () => VNode) {
  if (cond) return template();
  return createCommentVNode();
}

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

export function call_or_comment(
  fn_or_nil: (() => VNode | VNode[] | string | Nil) | Nil
) {
  let result: VNode | VNode[] | string | Nil;
  if (!isNil(fn_or_nil) && !isNil((result = fn_or_nil()))) {
    // if (isArray(result)) {
    //   return tpl(result);
    // }
    if (typeof result === "string") {
      return createTextVNode(result);
    }
    return result;
  }
  return createCommentVNode();
}
