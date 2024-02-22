import "reflect-metadata";

import Container from "typedi";
import { App } from "./app";

Container.get(App).listen();
