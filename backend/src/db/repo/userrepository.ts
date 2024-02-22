import { Service } from "typedi";
import { ShardManager } from "../shardmanager";
import { v4 } from "uuid";

@Service()
export class UserRepository {
  constructor(private readonly shardManager: ShardManager) {}

  public register() {
    const userId = v4();
    return this.shardManager.withConnection(
      userId,
      async (conn, shared, shardId) => {
        const result = await conn
          .insertInto("users")
          .returningAll()
          .values({ id: userId })
          .execute();

        await shared
          .insertInto("user_shard_locations")
          .values({ user_id: result[0].id, shard_id: shardId })
          .execute();

        return result[0];
      }
    );
  }

  public exists(userId: string): Promise<boolean> {
    return this.shardManager.withConnection(
      userId,
      async (conn) =>
        !!(
          await conn
            .selectFrom("users")
            .where("id", "=", userId)
            .selectAll()
            .limit(1)
            .execute()
        )[0].id
    );
  }
}
