import _ from "lodash";
import { AllowedComponentProps, Ref } from "vue";

/** 欺骗类型系统的面具。
 */
export function any(x: any) {
  return x as any;
}

/** class 简写。
 *
 * 在 Component 的类型系统不支持 class 但是实际库实现层面上又支持的时候使用。 */
export function c(s: TemplateStringsArray) {
  return { class: s.join("") } as any;
}

/** 类似 `v-model`。双向绑定的时候帮你偷个懒。 */
export function refvmodel<T>(v: Ref<T>) {
  return {
    modelValue: v.value,
    "onUpdate:modelValue": (value: T) => (v.value = value),
  } as any;
}

/** 将其它参数设置为 `new_value` 。*/
export function batch_set_ref<T, U extends T>(new_value: U, ...arr: Ref<T>[]) {
  arr.forEach((v) => {
    v.value = new_value;
  });
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

fix_compo_batch([1] as const);
