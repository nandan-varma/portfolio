#!/usr/bin/env node
// Uploads image files to UploadThing and prints the public URL for each.
// Usage: node scripts/upload-screenshot.mjs <file1> [file2 ...]
import fs from "node:fs";
import path from "node:path";

const envContent = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const tokenLine = envContent.split("\n").find((l) => l.trim().startsWith("UPLOADTHING_TOKEN"));
const apiKey = tokenLine.split("=").slice(1).join("=").trim().replace(/^"|"$/g, "");

const mimeTypes = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

async function uploadFile(filePath) {
	const buffer = fs.readFileSync(filePath);
	const name = path.basename(filePath);
	const type = mimeTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";

	const presignRes = await fetch("https://uploadthing.com/api/uploadFiles", {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Uploadthing-Api-Key": apiKey },
		body: JSON.stringify({ files: [{ name, size: buffer.length, type }] }),
	});
	const presignJson = await presignRes.json();
	if (!presignRes.ok || !presignJson.data) {
		throw new Error(`presign failed for ${name}: ${JSON.stringify(presignJson)}`);
	}
	const { url, fields, ufsUrl } = presignJson.data[0];

	const form = new FormData();
	for (const [key, value] of Object.entries(fields)) form.append(key, value);
	form.append("file", new Blob([buffer], { type }), name);

	const uploadRes = await fetch(url, { method: "POST", body: form });
	if (!uploadRes.ok) {
		throw new Error(`s3 upload failed for ${name}: ${uploadRes.status} ${await uploadRes.text()}`);
	}

	return ufsUrl;
}

const files = process.argv.slice(2);
if (files.length === 0) {
	console.error("Usage: node scripts/upload-screenshot.mjs <file1> [file2 ...]");
	process.exit(1);
}

for (const file of files) {
	const url = await uploadFile(file);
	console.log(`${file} -> ${url}`);
}
