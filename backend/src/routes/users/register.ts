import { Service } from "typedi";
import { UserRepository } from "../../db/repo/userrepository";
import type { Request, Response } from "express";

@Service()
export class RegisterHandler {
  constructor(private readonly userRepository: UserRepository) {}

  private readonly _middleware = (_req: Request, res: Response) => {
    this.userRepository
      .register()
      .then((user) => {
        res.cookie("userId", user.id, { httpOnly: true });
        res.status(201).json(user);
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
      });
  };

  public readonly middleware = this._middleware.bind(this);
}
