export const match = <T extends string | number | symbol, V>(
  value: T,
  handlers: { [K in T]: () => V }
): V => handlers[value]()
