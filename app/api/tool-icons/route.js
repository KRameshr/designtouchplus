import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  TOOL_ICON_OPTIONS,
  formatAssetLabel,
  getToolMonogram,
  validateSvgContent,
} from "@/lib/toolIcons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const MAX_ICON_SIZE_BYTES = 512 * 1024; // 512 KB
const ALLOWED_EXTENSIONS = new Set([".svg", ".png", ".webp"]);
const CANONICAL_FILENAMES = new Set(
  TOOL_ICON_OPTIONS.map((opt) => opt.filename.toLowerCase())
);

function getToolsAssetsDir() {
  return path.resolve(process.cwd(), "public", "assets", "tools");
}

function isValidPngBuffer(buf) {
  if (!buf || buf.length < 8) return false;
  return (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  );
}

function isValidWebpBuffer(buf) {
  if (!buf || buf.length < 12) return false;
  return (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

function checkXmlWellFormed(svgText) {
  // Strip XML declaration, comments, and CDATA before checking tag balance
  const cleaned = svgText
    .replace(/^\uFEFF/, "")
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "")
    .trim();

  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9:_-]*)(\s[^<>]*?)?(\/?)>/g;
  const stack = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(cleaned)) !== null) {
    const between = cleaned.slice(lastIndex, match.index);
    // Any stray '<' or '>' between matched tags indicates malformed XML
    if (between.includes("<") || between.includes(">")) {
      return false;
    }
    lastIndex = tagRegex.lastIndex;

    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith("</");
    const isSelfClosing = match[3] === "/";

    if (isClosing) {
      if (isSelfClosing || stack.length === 0) return false;
      const expected = stack.pop();
      if (expected !== tagName) return false;
    } else if (!isSelfClosing) {
      stack.push(tagName);
    }
  }

  const trailing = cleaned.slice(lastIndex);
  if (trailing.includes("<") || trailing.includes(">")) {
    return false;
  }

  return stack.length === 0;
}

async function verifyAdminAuth(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/tools/admin/all`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const toolsDir = getToolsAssetsDir();
    await fs.mkdir(toolsDir, { recursive: true });
    const entries = await fs.readdir(toolsDir, { withFileTypes: true });

    const diskFilenames = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return ALLOWED_EXTENSIONS.has(ext);
      })
      .sort((a, b) => a.localeCompare(b));

    const canonicalMap = new Map(
      TOOL_ICON_OPTIONS.map((opt) => [opt.filename.toLowerCase(), opt])
    );

    const icons = [...TOOL_ICON_OPTIONS];

    for (const filename of diskFilenames) {
      if (!canonicalMap.has(filename.toLowerCase())) {
        const stem = filename.replace(/\.[^.]+$/, "");
        const label = formatAssetLabel(filename);
        icons.push({
          key: stem.toLowerCase(),
          shortCode: getToolMonogram("", label),
          label,
          filename,
          src: `/assets/tools/${filename}`,
          isCustom: true,
        });
      }
    }

    return NextResponse.json(
      { icons },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        icons: TOOL_ICON_OPTIONS,
        error: err.message || "Failed to list local tool icons.",
      },
      { status: 200 }
    );
  }
}

export async function POST(request) {
  // 1. Verify Admin JWT against Spring Boot backend
  const isAdmin = await verifyAdminAuth(request);
  if (!isAdmin) {
    return NextResponse.json(
      { message: "Unauthorized. Admin sign-in is required to upload icons." },
      { status: 401 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid multipart form upload." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json(
      { message: "No icon file provided." },
      { status: 400 }
    );
  }

  const originalName = path.basename(String(file.name || "icon.svg"));
  const ext = path.extname(originalName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      {
        message:
          "Unsupported file format. Please upload an SVG (.svg), PNG (.png), or WebP (.webp) icon.",
      },
      { status: 400 }
    );
  }

  if (file.size <= 0) {
    return NextResponse.json(
      { message: "The selected icon file is empty." },
      { status: 400 }
    );
  }

  if (file.size > MAX_ICON_SIZE_BYTES) {
    return NextResponse.json(
      {
        message: "Icon file exceeds the maximum allowed size of 512 KB.",
      },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // 2. Validate file contents by format
  if (ext === ".svg") {
    const svgText = buffer.toString("utf8");
    const validation = validateSvgContent(svgText);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }
    if (!checkXmlWellFormed(svgText)) {
      return NextResponse.json(
        {
          message:
            "Malformed SVG file: XML tags are unbalanced or contain syntax errors.",
        },
        { status: 400 }
      );
    }
  } else if (ext === ".png") {
    if (!isValidPngBuffer(buffer)) {
      return NextResponse.json(
        { message: "Invalid PNG file: file header does not match PNG format." },
        { status: 400 }
      );
    }
  } else if (ext === ".webp") {
    if (!isValidWebpBuffer(buffer)) {
      return NextResponse.json(
        {
          message:
            "Invalid WebP file: file header does not match WebP format.",
        },
        { status: 400 }
      );
    }
  }

  // 3. Sanitize filename & prevent overwriting existing assets
  const rawStem = originalName
    .slice(0, originalName.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const safeStem = rawStem || "custom-tool-icon";
  const toolsDir = getToolsAssetsDir();
  await fs.mkdir(toolsDir, { recursive: true });

  const uploadHash = crypto.createHash("sha256").update(buffer).digest("hex");

  let candidateFilename = `${safeStem}${ext}`;
  let suffix = 1;

  while (true) {
    const candidatePath = path.resolve(toolsDir, candidateFilename);
    if (!candidatePath.startsWith(toolsDir + path.sep)) {
      return NextResponse.json(
        { message: "Invalid icon filename." },
        { status: 400 }
      );
    }

    try {
      const existingBuffer = await fs.readFile(candidatePath);
      const existingHash = crypto
        .createHash("sha256")
        .update(existingBuffer)
        .digest("hex");

      // If identical file already exists on disk, reuse it without overwriting
      if (existingHash === uploadHash) {
        const stem = candidateFilename.replace(/\.[^.]+$/, "");
        const canonical = TOOL_ICON_OPTIONS.find(
          (opt) => opt.filename.toLowerCase() === candidateFilename.toLowerCase()
        );
        const iconMeta = canonical || {
          key: stem.toLowerCase(),
          shortCode: getToolMonogram("", formatAssetLabel(candidateFilename)),
          label: formatAssetLabel(candidateFilename),
          filename: candidateFilename,
          src: `/assets/tools/${candidateFilename}`,
          isCustom: !CANONICAL_FILENAMES.has(candidateFilename.toLowerCase()),
        };

        return NextResponse.json({ icon: iconMeta }, { status: 200 });
      }

      // Different content exists under this filename — increment suffix to avoid overwriting
      suffix += 1;
      candidateFilename = `${safeStem}-${suffix}${ext}`;
    } catch {
      // File does not exist yet — safe to write
      // Also protect canonical filenames even if missing
      if (CANONICAL_FILENAMES.has(candidateFilename.toLowerCase())) {
        suffix += 1;
        candidateFilename = `${safeStem}-${suffix}${ext}`;
        continue;
      }
      break;
    }
  }

  const finalPath = path.resolve(toolsDir, candidateFilename);
  if (!finalPath.startsWith(toolsDir + path.sep)) {
    return NextResponse.json(
      { message: "Invalid destination path." },
      { status: 400 }
    );
  }

  await fs.writeFile(finalPath, buffer);

  const label = formatAssetLabel(candidateFilename);
  const iconMeta = {
    key: candidateFilename.replace(/\.[^.]+$/, "").toLowerCase(),
    shortCode: getToolMonogram("", label),
    label,
    filename: candidateFilename,
    src: `/assets/tools/${candidateFilename}`,
    isCustom: true,
  };

  return NextResponse.json({ icon: iconMeta }, { status: 201 });
}

