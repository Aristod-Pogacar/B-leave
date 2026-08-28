export function PartialType<T>(classRef: T) {
  return class extends (classRef as any) {};
}
