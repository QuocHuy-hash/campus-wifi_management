/**
 * Các hàm chuyển đổi giữa camelCase và snake_case cho object/array.
 * Dùng trong axios interceptor để đồng bộ contract JSON snake_case của backend
 * với kiểu dữ liệu camelCase trong TypeScript frontend.
 */

function toCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (char: string) => `_${char.toLowerCase()}`);
}

function transformKeys<T>(value: T, transformer: (key: string) => string): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date || value instanceof RegExp) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformKeys(item, transformer)) as unknown as T;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[transformer(key)] = transformKeys(val, transformer);
    }
    return result as T;
  }

  return value;
}

/**
 * Chuyển object/array từ snake_case sang camelCase.
 */
export function snakeToCamelCase<T>(value: T): T {
  return transformKeys(value, toCamelCase);
}

/**
 * Chuyển object/array từ camelCase sang snake_case.
 */
export function camelToSnakeCase<T>(value: T): T {
  return transformKeys(value, toSnakeCase);
}
