import express, { type Express } from "express";
import { Environment } from "./config/environment";
import bodyParser from "body-parser";
import { Logger } from "./logs/logger";
import { NoteListHandler } from "./routes/notes/notelisthandler";
import { RegisterHandler } from "./routes/users/register";
import { NoteCreateHandler } from "./routes/notes/notecreatehandler";
import { Service } from "typedi";
import cookieParser from "cookie-parser";

@Service()
export class App {
  private readonly expressApp: Express = express();

  constructor(
    noteCreateHandler: NoteCreateHandler,
    noteListHandler: NoteListHandler,
    regiserHandler: RegisterHandler,
    private readonly environment: Environment,
    private readonly logger: Logger
  ) {
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(cookieParser());
    this.expressApp.use(logger.middleware());

    this.expressApp.get("/notes", noteListHandler.middleware);
    this.expressApp.post("/notes", noteCreateHandler.middleware);
    this.expressApp.post("/register", regiserHandler.middleware);
  }

  public listen(port?: number, callback?: () => void) {
    const _port =
      port ??
      this.environment.get("PORT", {
        parse: parseInt,
        def: 3000,
      });
    this.logger.info("Listening on port " + _port);
    this.expressApp.listen(callback);
  }
}
