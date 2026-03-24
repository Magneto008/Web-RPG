#!/usr/bin/env node

const COLUMNS = 13;

function parseIntArg(value, label) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return parsed;
}

function printUsage() {
  console.log("Roguelike frame helper (13 columns, 16x16 tiles)");
  console.log("");
  console.log("Usage:");
  console.log("  npm run frame -- row <row> col <col>");
  console.log("  npm run frame -- index <frameIndex>");
  console.log("");
  console.log("Examples:");
  console.log("  npm run frame -- row 4 col 6");
  console.log("  npm run frame -- index 58");
}

function run() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  if (args[0] === "row" && args[2] === "col" && args.length >= 4) {
    const row = parseIntArg(args[1], "row");
    const col = parseIntArg(args[3], "col");

    if (row < 0 || col < 0 || col >= COLUMNS) {
      throw new Error("Row must be >= 0, and col must be between 0 and 12.");
    }

    const frame = row * COLUMNS + col;
    console.log(`frame = ${frame}`);
    return;
  }

  if (args[0] === "index" && args.length >= 2) {
    const index = parseIntArg(args[1], "index");

    if (index < 0) {
      throw new Error("Index must be >= 0.");
    }

    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    console.log(`row = ${row}, col = ${col}`);
    return;
  }

  throw new Error("Invalid arguments. Run with --help for usage.");
}

try {
  run();
} catch (error) {
  console.error((error).message);
  process.exit(1);
}
