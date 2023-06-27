import _, { fromPairs } from "lodash";
import { type } from "os";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { AllowedComponentProps, Ref, VNode } from "vue";

/** 欺骗类型系统的面具。
 */
export function any(x: any) {
  return x as any;
}

export function cl(_class: string[] | string) {
  return any({
    class: _class,
  });
}

export function try_it(fn: () => any, on_err: (e: any) => void) {
  try {
    fn();
  } catch (e) {
    on_err(e);
  }
}

export function slot<N extends string, V>(name: N, value: V) {
  return {
    [name]: value,
  } as {
    N: V;
  };
}

/** class 简写。
 *
 * 在 Component 的类型系统不支持 class 但是实际库实现层面上又支持的时候使用。 */
export function c(s: TemplateStringsArray) {
  return { class: s.join("") } as any;
}

export function st(s: TemplateStringsArray) {
  return { style: s.join("") } as any;
}

export function carr(s: string[]) {
  return { class: s.join("") } as any;
}

/** 类似 `v-model`。双向绑定的时候帮你偷个懒。 */
export function refvmodel<T>(v: Ref<T>, name = "modelValue") {
  return {
    [name]: v.value,
    [`onUpdate:${name}` as const]: (value: T) => (v.value = value),
  } as any;
}

export function refvmodel_type<const T, const N extends string = "modelValue">(
  v: Ref<T>,
  name: N
) {
  type onUpdate<T extends string> = `onUpdate:${T}`;
  return {
    [name]: v.value,
    [`onUpdate:${name}`]: (value: T) => (v.value = value),
  } as any as Record<N, T> & Record<onUpdate<N>, (value: T) => void>;
}

export function as_props<T extends {}>() {
  return <const U extends (keyof T)[]>(props: U) => props as any;
}

export const as_emits = as_props;

/** 将其它参数设置为 `new_value` 。*/
export function batch_set_ref<T, U extends T>(new_value: U, ...arr: Ref<T>[]) {
  arr.forEach((v) => {
    v.value = new_value;
  });
}

/** 非空字符串或 `_else` */
export function non_empty_else<T>(s: string, _else: T) {
  if (s.length > 0) {
    return s;
  }
  return _else;
}

export function scroll_to(el: HTMLElement) {
  window.scrollTo({
    top: el.clientHeight,
    behavior: "smooth",
  });
}

/** 如果离得很近，就滚动到最下面。 */
export function scroll_if_close_to(el: HTMLElement, delta: number) {
  if (window.scrollY + window.innerHeight + delta > el.clientHeight) {
    scroll_to(el);
    return true;
  }
  return false;
}

/** 在 `fn` 的 `Promise` 完成前后更改 `loading_ref` 的状态。
 *
 * * 完成前：`loading_ref.value = true;`
 * * 完成后：`loading_ref.value = false;`
 *
 * `loading_ref` 可以作为冻结某些交互组件的标志。
 */
export async function promise_with_ref(
  fn: () => Promise<any>,
  loading_ref: Ref<boolean>,
  error_callback: (e: any) => any = _.noop
) {
  try {
    loading_ref.value = true;
    await fn();
  } catch (e) {
    await error_callback(e);
  }
  loading_ref.value = false;
}

export type Nil = undefined | null;
export type NotNil<T> = Exclude<T, null | undefined>;

export class Maybe<T> {
  value: T | Nil;
  constructor(value?: T) {
    this.value = value;
  }
  static of<T>(value?: T): Maybe<T> {
    return new Maybe(value);
  }
  unwrap_or<U>(_default: U) {
    if (this.is_nil()) {
      return _default;
    }
    return this.value as NotNil<T>;
  }
  map<U>(mapper: (value: NotNil<T>) => U) {
    if (this.is_nil()) return Maybe.of<U>();
    return Maybe.of(mapper(this.value as NotNil<T>));
  }
  chain<U>(wraper: (value: NotNil<T>) => Maybe<U>) {
    if (this.is_nil()) return Maybe.of<U>();
    return wraper(this.value as NotNil<T>);
  }
  is_nil() {
    return _.isNil(this.value);
  }
  is_some() {
    return !_.isNil(this.value);
  }
}

export type ElementOfArray<A> = A extends (infer T)[] ? T : never;

export function fix_compo<T>(c: T) {
  return c as T & AllowedComponentProps;
}

export function fix_compo_batch<
  X extends readonly [...Rest],
  Rest extends Array<any>
>(cs: X) {
  return cs as any as {
    [P in keyof X]: X[P] & { $props: AllowedComponentProps };
  };
}

export function arr_or_pack_to_arr<T>(maybe_arr: T): T extends any[] ? T : [T] {
  if (Array.isArray(maybe_arr)) {
    return maybe_arr as any;
  }
  return [maybe_arr] as any;
}

export function call<T extends () => any>(
  fn: T
): T extends () => infer U ? U : never {
  return fn();
}

export function parse_param_to_Record(param: string) {
  return fromPairs(param.split("&").map((it) => it.split("=")));
}

export function add_space_between_cjk_and_english(text: string) {
  return text
    .replace(/([\d_-]*\p{Cased_Letter}+[\d_-]*)(\p{Other_Letter}+)/gu, "$1 $2")
    .replace(/([\d_-]*\p{Other_Letter}+[\d_-]*)(\p{Cased_Letter}+)/gu, "$1 $2");
}

/** 执行 `fn` 后，按顺序执行 `pp_fns` 所有函数，然后返回 `fn` 的值 */
export function run_and_pps<T extends (...args: any) => any>(
  fn: T,
  pp_fns: (() => any)[]
) {
  return async (...args: Parameters<T>) => {
    const result = await fn.apply({}, args);
    for (let index = 0; index < pp_fns.length; index++) {
      const pp_fn = pp_fns[index];
      await pp_fn();
    }
    return result;
  };
}

/** 执行 `fn` 后，执行 `pp_fn`，然后返回 `fn` 的值 */
export function run_and_pp<T extends (...args: any) => any>(
  fn: T,
  pp_fn: () => any
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>) => {
    const result = await fn.apply({}, args);
    await pp_fn();
    return result;
  };
}

export function generate_random_name() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
  });
}
