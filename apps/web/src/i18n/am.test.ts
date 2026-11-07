import { describe, expect, it } from "vitest";
import { am } from "./am";
describe("Amharic message catalog", () => {
  it("contains the core marketplace labels", () => {
    expect(am.marketplace).toBeTruthy();
    expect(am.traders).toBeTruthy();
    expect(am.checkout).toBeTruthy();
    expect(am.demoData).toBeTruthy();
  });
});
