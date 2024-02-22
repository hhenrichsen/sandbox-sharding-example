import { Service } from "typedi";
import { UserRepository } from "../../db/repo/userrepository";
import type { Request, Response } from "express";

@Service()
export class Authenticator {
  constructor(private readonly userRepository: UserRepository) {}

  public async withAuth(
    req: Request,
    res: Response,
    authed: (userId: string) => void
  ) {
    console.log(req.cookies);
    const cookie =
      typeof req?.cookies?.userId == "string" ? req.cookies.userId : undefined;

    if (!cookie) {
      res.status(401).json({ error: "Invalid cookie" });
      return;
    }

    try {
      if (await this.userRepository.exists(cookie)) {
        authed(cookie);
        return;
      }
    } catch {}

    res.status(401).json({ error: "Unauthorized" });
    return;
  }
}
