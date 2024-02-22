import { Service } from "typedi";
import { Authenticator } from "../middleware/authenticator";
import { NoteRepository } from "../../db/repo/noterepository";
import type { Request, Response } from "express";
import z from "zod";

@Service()
export class NoteCreateHandler {
  constructor(
    private readonly authenticator: Authenticator,
    private readonly noteRepository: NoteRepository
  ) {}

  private static readonly Validator = z.object({
    content: z.string(),
    title: z.string(),
  });

  private readonly _middleware = async (req: Request, res: Response) => {
    await this.authenticator.withAuth(req, res, (userId) => {
      const parseResult = NoteCreateHandler.Validator.safeParse(req.body);
      if (!parseResult.success) {
        res
          .status(400)
          .json({ error: "Invalid request body", details: parseResult.error });
        return;
      }
      this.noteRepository
        .createNote(userId, parseResult.data.title, parseResult.data.content)
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
