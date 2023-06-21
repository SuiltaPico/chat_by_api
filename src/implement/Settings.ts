import { nanoid } from "nanoid";

export function generate_apikey_id() {
  return Date.now() + nanoid();
}
