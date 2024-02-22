import { Service } from "typedi";

@Service({ eager: true })
export class Environment {
  public getRequired(key: string): string;
  public getRequired<R>(
    key: string,
    options?: {
      def: R;
    }
  ): R;
  public getRequired<R>(
    key: string,
    options?: {
      parse: (value: string) => R;
    }
  ): R;
  public getRequired<R>(
    key: string,
    options?: {
      parse?: (value: string) => R | undefined;
      def?: R | undefined;
    }
  ): R {
    const { parse, def } = options ?? {};
    const value = process.env[key];
    if (value === undefined) {
      if (def !== undefined) {
        return def;
      }
      throw new Error(`Missing required environment variable ${key}`);
    }
    if (typeof parse === "function") {
      try {
        const parsed = parse(value);
        if (parsed === undefined) {
          throw new Error(`Failed to parse environment variable ${key}`);
        }
        return parsed;
      } catch {
        throw new Error(`Failed to parse environment variable ${key}`);
      }
    }
    // Cast needed because if both parse and def are undefined, the type of value
    // is string | undefined, but we can't narrow that on the base function
    // definition.
    return value as unknown as R;
  }

  public get(key: string): string | undefined;
  public get<R>(
    key: string,
    options?: {
      parse: (value: string) => R;
      def: R;
    }
  ): R;
  public get<R>(
    key: string,
    options?: {
      def: R;
    }
  ): R;
  public get<R>(
    key: string,
    options?: {
      parse: (value: string) => R;
    }
  ): R;
  public get<R>(
    key: string,
    options?: {
      parse?: (value: string) => R | undefined;
      def?: R | undefined;
    }
  ): R | undefined {
    const { parse, def } = options ?? {};
    const value = process.env[key];
    if (value === undefined) {
      if (def !== undefined) {
        return def;
      }
      return undefined;
    }
    if (typeof parse === "function") {
      try {
        const parsed = parse(value);
        if (parsed === undefined) {
          return undefined;
        }
        return parsed;
      } catch {
        return undefined;
      }
    }
    // Cast needed because if both parse and def are undefined, the type of value
    // is string | undefined, but we can't narrow that on the base function
    // definition.
    return value as unknown as R;
  }
}
