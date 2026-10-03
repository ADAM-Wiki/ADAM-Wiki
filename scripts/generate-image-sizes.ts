import fs from "node:fs";
import path from "node:path";

/**
 * Records the intrinsic size of every article image in
 * src/lib/generated/imageSizes.ts.
 *
 * <ArticleImage> needs width and height on the <img> so the browser can reserve
 * the right box before the file arrives. Without them a scan-heavy article
 * reflows once per image as it loads, and the reader loses their place several
 * times on the way down the page.
 *
 * Dimensions are read straight out of the file headers rather than through an
 * image library: the three formats in public/images all state their size in the
 * first few dozen bytes, and decoding 300 files to learn something written in
 * byte 26 would be the slow way round.
 *
 * The OG cards are skipped - they are generated at a fixed 1200x630 and are
 * never rendered by <ArticleImage>.
 */

const IMAGE_DIR = path.resolve("public/images");
const OUTPUT = path.resolve("src/lib/generated/imageSizes.ts");
const SKIP_DIRS = new Set(["og"]);
const EXTENSIONS = new Set([".webp", ".png", ".jpg", ".jpeg"]);

interface Size {
  width: number;
  height: number;
}

/**
 * WebP keeps its size in the first chunk after the RIFF header, in a different
 * place for each of the three encodings. VP8X is the extended form written for
 * animation, alpha or metadata; VP8L is lossless; "VP8 " is plain lossy.
 */
function webpSize(buffer: Buffer): Size | null {
  if (buffer.length < 30) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buffer.toString("ascii", 8, 12) !== "WEBP") return null;

  const format = buffer.toString("ascii", 12, 16);

  if (format === "VP8X") {
    // Canvas size, stored as 24-bit little-endian (value - 1).
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }

  if (format === "VP8L") {
    // 0x2f signature byte, then 14 bits of width-1 and 14 bits of height-1
    // packed into the next four bytes.
    if (buffer[20] !== 0x2f) return null;
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (format === "VP8 ") {
    // 3-byte frame tag, then the 0x9d012a start code, then the two 14-bit
    // dimensions. The top two bits of each are a scale hint, not size.
    if (buffer.readUIntBE(23, 3) !== 0x9d012a) return null;
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  return null;
}

/** IHDR is required to be the first chunk, so the size is always at byte 16. */
function pngSize(buffer: Buffer): Size | null {
  if (buffer.length < 24) return null;
  if (buffer.readUInt32BE(0) !== 0x89504e47) return null;
  if (buffer.toString("ascii", 12, 16) !== "IHDR") return null;

  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/**
 * JPEG has no fixed header offset - the size lives in whichever start-of-frame
 * marker the encoder used, so the segment chain has to be walked to find it.
 */
function jpegSize(buffer: Buffer): Size | null {
  if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) return null;

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    // Every SOFn carries the dimensions except the four that are not frames at
    // all: DHT (c4), JPG (c8) and DAC (cc).
    const isFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function readSize(file: string): Size | null {
  // The header is all that matters, so only the first block is read.
  const handle = fs.openSync(file, "r");
  const buffer = Buffer.alloc(65536);

  try {
    const read = fs.readSync(handle, buffer, 0, buffer.length, 0);
    const header = buffer.subarray(0, read);

    switch (path.extname(file).toLowerCase()) {
      case ".webp":
        return webpSize(header);
      case ".png":
        return pngSize(header);
      case ".jpg":
      case ".jpeg":
        return jpegSize(header);
      default:
        return null;
    }
  } finally {
    fs.closeSync(handle);
  }
}

/** Every image under public/images, as paths the browser would request. */
function collect(dir: string, base: string, out: string[]): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collect(path.join(dir, entry.name), `${base}/${entry.name}`, out);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(`${base}/${entry.name}`);
    }
  }

  return out;
}

function run(): void {
  if (!fs.existsSync(IMAGE_DIR)) {
    console.warn(`No ${IMAGE_DIR}; skipping image sizes.`);
    return;
  }

  const files = collect(IMAGE_DIR, "/images", []).sort();
  const entries: string[] = [];
  const unreadable: string[] = [];

  for (const file of files) {
    const size = readSize(path.resolve("public", `.${file}`));

    if (!size || !size.width || !size.height) {
      unreadable.push(file);
      continue;
    }

    entries.push(
      `  ${JSON.stringify(file)}: [${size.width}, ${size.height}],`,
    );
  }

  const source = `// AUTO-GENERATED by scripts/generate-image-sizes.ts. Do not edit by hand.
// Maps a public image path to its intrinsic [width, height] in pixels, so
// <ArticleImage> can reserve the right box before the file loads.
export const IMAGE_SIZES: Record<string, [number, number]> = {
${entries.join("\n")}
};
`;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, source, "utf8");

  // Loud rather than silent: an unreadable file is one that will still shift
  // the page, and it will not show up anywhere else.
  if (unreadable.length) {
    console.warn(
      `Image sizes: could not read ${unreadable.length} file(s):\n  ${unreadable.join("\n  ")}`,
    );
  }

  console.log(`Image sizes: ${entries.length} of ${files.length} measured.`);
}

run();
