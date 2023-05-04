import _ from "lodash";
import { AllowedComponentProps, Ref } from "vue";

export function any(x: any) {
  return x as any;
}

export function c(s: TemplateStringsArray) {
  return { class: s.join("") } as any;
}

export function refvmodel<T>(v: Ref<T>) {
  return {
    modelValue: v.value,
    "onUpdate:modelValue": (value: T) => (v.value = value),
  } as any;
}

export function batch_set_ref<T, U extends T>(new_value: U, ...arr: Ref<T>[]) {
  arr.forEach((v) => {
    v.value = new_value;
  });
}


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
