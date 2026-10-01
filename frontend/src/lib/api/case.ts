function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function mapKeys(value: unknown, convert: (key: string) => string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => mapKeys(item, convert));
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => [convert(key), mapKeys(val, convert)]));
  }
  return value;
}

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

export function toSnakeCase<T>(value: T): unknown {
  return mapKeys(value, toSnake);
}

export function toCamelCase<T>(value: T): unknown {
  return mapKeys(value, toCamel);
}
