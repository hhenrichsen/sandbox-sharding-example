import { Kysely, PostgresDialect, type KyselyConfig } from "kysely";
import type { DB } from "kysely-codegen";
import { Pool } from "pg";
import { Environment } from "../config/environment";
import { Service } from "typedi";

@Service()
export class ShardManager {
  private readonly db1: Kysely<DB>;
  private readonly db2: Kysely<DB>;
  private readonly db3: Kysely<DB>;
  private readonly db4: Kysely<DB>;

  private readonly retryDelay;
  private readonly initialRetryDelay;

  private queue: [
    string,
    (
      conn: Kysely<DB>,
      sharedConn: Kysely<DB>,
      shardId: number
    ) => Promise<unknown>,
    (value: unknown) => void,
    (error: unknown) => void,
    number
  ][] = [];

  private readonly shards: Kysely<DB>[];

  constructor(environment: Environment) {
    this.retryDelay = environment.get("SHARD_RETRY_DELAY", {
      parse: parseInt,
      def: 5_000,
    });
    this.initialRetryDelay = environment.get("SHARD_INITIAL_RETRY_DELAY", {
      parse: parseInt,
      def: 2_500,
    });

    const baseArgs: (args: { connectionString: string }) => KyselyConfig = (
      args
    ) => ({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: args.connectionString,
        }),
      }),
    });

    this.db1 = new Kysely<DB>(
      baseArgs({
        connectionString: environment.getRequired("DB1_URL"),
      })
    );
    this.db2 = new Kysely<DB>(
      baseArgs({
        connectionString: environment.getRequired("DB2_URL"),
      })
    );
    this.db3 = new Kysely<DB>(
      baseArgs({
        connectionString: environment.getRequired("DB3_URL"),
      })
    );
    this.db4 = new Kysely<DB>(
      baseArgs({
        connectionString: environment.getRequired("DB4_URL"),
      })
    );
    this.shards = [this.db1, this.db2, this.db3, this.db4];
  }

  private getShardIdByUserId(userId: string): number {
    switch (userId[0]) {
      case "0":
      case "1":
      case "2":
      case "3":
        return 0;
      case "4":
      case "5":
      case "6":
      case "7":
        return 1;
      case "8":
      case "9":
      case "a":
      case "b":
        return 1;
      case "c":
      case "d":
      case "e":
      case "f":
        return 2;
    }
    throw new Error("Invalid UUID format");
  }

  public async withConnection<R>(
    userId: string,
    callback: (
      conn: Kysely<DB>,
      sharedConn: Kysely<DB>,
      shardId: number
    ) => Promise<R>
  ): Promise<R> {
    const p = new Promise((resolve, reject) => {
      this.queue.push([userId, callback, resolve, reject, 0]);
    });
    this.processQueue();
    // Need to cast to Promise<R> because TypeScript doesn't understand that the
    // type of p is Promise<R> after the push.
    return p as Promise<R>;
  }

  private processQueue() {
    setImmediate(async () => {
      if (this.queue.length === 0) {
        return;
      }
      const [userId, callback, resolve, reject, attempts] = this.queue.shift()!;
      const shardId = this.getShardIdByUserId(userId);
      const shard = this.shards[shardId];
      try {
        const result = await callback(shard, this.db1, shardId);
        resolve(result);
      } catch (error) {
        if ((error as { code: string }).code.startsWith("ECONN")) {
          setTimeout(() => {
            this.queue.push([userId, callback, resolve, reject, attempts + 1]);
            this.processQueue();
          }, attempts * this.retryDelay + this.initialRetryDelay);
        } else {
          reject(error);
        }
      }
    });
  }
}
