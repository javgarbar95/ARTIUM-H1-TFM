// Copies the exact supplied PNG; no resizing, cropping, tracing or background removal.
import fs from "node:fs/promises";
import path from "node:path";
const source = process.argv[2];
if (!source)
  throw new Error("Uso: node scripts/install-logo.mjs /ruta/al/logo-final.png");
const bytes = await fs.readFile(source);
if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
  throw new Error("Se necesita el archivo PNG original.");
const root = path.resolve(import.meta.dirname, "..");
await fs.copyFile(source, path.join(root, "assets/brand/logo-final.png"));
await fs.writeFile(
  path.join(root, "src/theme/brand.ts"),
  "import {ImageSourcePropType} from 'react-native';\nexport const brandLogo:ImageSourcePropType|null=require('../../assets/brand/logo-final.png');\n",
);
console.log(
  "PNG original integrado sin modificaciones. Reinicia Metro para incluirlo.",
);
