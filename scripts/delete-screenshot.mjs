#!/usr/bin/env node
// Deletes files from UploadThing by file key (the trailing segment of the ufs.sh URL).
// Usage: node scripts/delete-screenshot.mjs <fileKey1> [fileKey2 ...]
import fs from "node:fs";

const envContent = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const tokenLine = envContent.split("\n").find((l) => l.trim().startsWith("UPLOADTHING_TOKEN"));
const apiKey = tokenLine.split("=").slice(1).join("=").trim().replace(/^"|"$/g, "");

const fileKeys = process.argv.slice(2);
if (fileKeys.length === 0) {
	console.error("Usage: node scripts/delete-screenshot.mjs <fileKey1> [fileKey2 ...]");
	process.exit(1);
}

const res = await fetch("https://uploadthing.com/api/deleteFile", {
	method: "POST",
	headers: { "Content-Type": "application/json", "X-Uploadthing-Api-Key": apiKey },
	body: JSON.stringify({ fileKeys }),
});
console.log(await res.json());
