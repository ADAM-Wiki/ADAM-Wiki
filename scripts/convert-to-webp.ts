import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Converts article JPGs to WebP next to the originals.
 *
 * Usage:
 *   npm run images:webp                convert everything (dry-run first!)
 *   npm run images:webp -- --dry-run   list what would convert, touch nothing
 *   npm run images:webp -- --dir public/images/spisi --quality 90
 *
 * Originals are kept: delete a JPG only after checking the .webp looks right
 * and no page still references the old path (grep for the filename in src/).
 * Run npm run generate:meta afterwards so imageSizes picks up the new files.
 *
 * Skipped by default, on purpose:
 * - public/images/og/** and og-default.jpg are OG cards for link previews.
 *   Chat/social crawlers still handle JPG more reliably than WebP, so those
 *   stay JPG. Pass --include-og to convert them anyway.
 */
const IMAGE_DIR = path.resolve("public/images");
const SKIP_DIRS = new Set(["og"]);
const SKIP_FILES = new Set(["og-default.jpg", "og-default.jpeg"]);
const EXTENSIONS = new Set([".jpg", ".jpeg"]);

function parseArgs(argv: string[]): {
  dir: string;
  quality: number;
  dryRun: boolean;
  includeOg: boolean;
} {
  const out = {
    dir: IMAGE_DIR,
    quality: 85,
    dryRun: false,
    includeOg: false,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dir" && argv[i + 1]) out.dir = path.resolve(argv[++i]);
    else if (argv[i] === "--quality" && argv[i + 1])
      out.quality = Number(argv[++i]);
    else if (argv[i] === "--dry-run") out.dryRun = true;
    else if (argv[i] === "--include-og") out.includeOg = true;
  }
  return out;
}

function collect(dir: string, out: string[]): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(full, out);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function isSkipped(file: string, root: string, includeOg: boolean): boolean {
  if (includeOg) return false;
  const rel = path.relative(root, file);
  if (rel.split(path.sep).includes("og")) return true;
  return SKIP_FILES.has(path.basename(file).toLowerCase());
}

async function run(): Promise<void> {
  const { dir, quality, dryRun, includeOg } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(dir)) {
    console.error(`No such directory: ${dir}`);
    process.exit(1);
  }

  const files = collect(dir, []).sort();
  let converted = 0;
  let skippedUpToDate = 0;
  let skippedOg = 0;
  let beforeBytes = 0;
  let afterBytes = 0;

  for (const file of files) {
    if (isSkipped(file, IMAGE_DIR, includeOg)) {
      skippedOg++;
      continue;
    }

    const out = file.replace(/\.(jpe?g)$/i, ".webp");
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(file).mtimeMs) {
      skippedUpToDate++;
      continue;
    }

    const before = fs.statSync(file).size;
    if (dryRun) {
      console.log(`would convert  ${path.relative(dir, file)} (${Math.round(before / 1024)} KB)`);
      converted++;
      continue;
    }

    await sharp(file).webp({ quality, effort: 6 }).toFile(`${out}.tmp`);
    fs.renameSync(`${out}.tmp`, out);
    const after = fs.statSync(out).size;
    beforeBytes += before;
    afterBytes += after;
    converted++;
    console.log(
      `converted  ${path.relative(dir, file)}  ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`,
    );
  }

  console.log(
    `\n${dryRun ? "(dry run) " : ""}Done: ${converted} converted, ${skippedUpToDate} up to date, ${skippedOg} OG skipped.`,
  );
  if (!dryRun && converted > 0) {
    const saved = Math.round((1 - afterBytes / beforeBytes) * 100);
    console.log(
      `Total: ${Math.round(beforeBytes / 1024)} KB -> ${Math.round(afterBytes / 1024)} KB (${saved}% smaller). Originals kept - delete JPGs by hand after verifying.`,
    );
  }
}

void run();
