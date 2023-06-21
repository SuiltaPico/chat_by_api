export function with_id<T extends object>(
  o: T,
  id: string
) {
  return { ...o, id };
}