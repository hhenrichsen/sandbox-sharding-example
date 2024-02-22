import { Service } from "typedi";
import { ShardManager } from "../shardmanager";

@Service()
export class NoteRepository {
  constructor(private readonly shardManager: ShardManager) {}

  public getUserNotes(userId: string) {
    return this.shardManager.withConnection(userId, async (conn) =>
      conn
        .selectFrom("notes")
        .selectAll()
        .where("notes.user_id", "=", userId)
        .execute()
    );
  }

  public createNote(userId: string, title: string, content: string) {
    return this.shardManager.withConnection(userId, async (conn) =>
      conn
        .insertInto("notes")
        .values({ user_id: userId, title, content })
        .returning("id")
        .returning("title")
        .returning("content")
        .returning("created_at")
        .execute()
    );
  }
}
