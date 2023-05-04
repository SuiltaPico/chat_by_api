import {
  ComponentOptionsMixin,
  ComputedOptions,
  EmitsOptions,
  MethodOptions,
  defineComponent,
} from "vue";
import type { ComponentOptionsBase } from "vue";

export function define_component_with_prop<
  Props extends object,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  EE extends string = string
>(
  props: (keyof Props)[],
  setup: ComponentOptionsBase<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >["setup"]
) {
  return defineComponent<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >({
    props: props as any,
    setup,
  });
}
