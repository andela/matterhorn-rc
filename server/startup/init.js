import { Reaction, Logger } from "/server/api";
import dotenv from "dotenv";

dotenv.config();
/*
 * Execute start up fixtures
 */

export default function () {
  Reaction.init();
  // we've finished all reaction core initialization
  Logger.info("Reaction initialization finished.");
}
