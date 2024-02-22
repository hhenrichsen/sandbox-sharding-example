import { Service } from "typedi";
import { Authenticator } from "../middleware/authenticator";
import { NoteRepository } from "../../db/repo/noterepository";
import type { Request, Response } from "express";

@Service()
export class NoteListHandler {
  constructor(
    private readonly authenticator: Authenticator,
    private readonly noteRepository: NoteRepository
  ) {}

  private readonly _middleware = async (req: Request, res: Response) => {
    await this.authenticator.withAuth(req, res, (userId) => {
      this.noteRepository
        .getUserNotes(userId)
        .then((notes) => {
          res.status(200).json(notes);
        })
        .catch((err) => {
          res.status(500).json({ error: err.message });
        });
    });
  };

  public readonly middleware = this._middleware.bind(this);
}
