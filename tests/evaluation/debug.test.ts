import { describe, it } from "vitest";
import * as bleuNamespace from "../../src/services/metrics/logmark/bleu.js";
import fs from "fs";

describe("Debug index logic", () => {
  it("logs", () => {
    fs.writeFileSync("debug-out3.json", JSON.stringify({
      namespaceKeys: Object.keys(bleuNamespace),
      hasDefault: 'default' in bleuNamespace,
      defaultKeys: 'default' in bleuNamespace ? Object.keys((bleuNamespace as any).default || {}) : [],
      calculateBLEU_from_default: 'default' in bleuNamespace ? typeof (bleuNamespace as any).default.calculateBLEU : 'none',
      calculateBLEU_from_namespace: typeof (bleuNamespace as any).calculateBLEU
    }));
  });
});
