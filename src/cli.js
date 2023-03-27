#!/usr/bin/env node
const [, , dirPath, ...args] = process.argv;
console.log("Sync Drive to", dirPath);
console.log("args", args);

import { sync } from "./sync.mjs";
import { env } from "./utils.mjs";

const folderId = args[0] ?? env.GOOGLE_DRIVE_FOLDER_ID ?? undefined;
await sync({ folderId, dirPath });
