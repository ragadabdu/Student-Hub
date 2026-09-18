// Recursive snake_case <-> camelCase conversion.
//
// The backend (Rails) sends snake_case JSON (`looking_for`, `avatar_url`).
// The frontend (TypeScript) uses camelCase (`lookingFor`, `avatarUrl`).
// This module bridges them at the API boundary — the only place JSON
// crosses between the two worlds.
//
// Rules:
//   - Object keys are converted recursively
//   - Arrays are preserved as arrays, with each element converted
//   - Primitives (strings, numbers, booleans, null) pass through unchanged
//   - Date objects are preserved (they can appear in local state even if
//     they never arrive over the wire)
//   - Underscore-prefixed keys (e.g. `_destroy`) are preserved (Rails convention)

const toCamel = (key: string): string =>
  key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const toSnake = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/^_/, '')
    .toLowerCase();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date);

export function keysToCamel<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => keysToCamel(item)) as unknown as T;
  }

  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      result[toCamel(key)] = keysToCamel(value);
    }
    return result as T;
  }

  return input as T;
}

export function keysToSnake<T = unknown>(input: unknown): T {
  if (Array.isArray(input)) {
    return input.map((item) => keysToSnake(item)) as unknown as T;
  }

  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Preserve underscore-prefixed keys like `_destroy`
      const outKey = key.startsWith('_') ? key : toSnake(key);
      result[outKey] = keysToSnake(value);
    }
    return result as T;
  }

  return input as T;
}
