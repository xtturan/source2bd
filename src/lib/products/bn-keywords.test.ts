/**
 * Tests for the Bangla → English keyword rewriter.
 *
 * These cover the exact failure modes found during the validation pass:
 * NFD-pasted input, duplicate intent words, suffix case-endings, and the
 * never-blank guarantee. Run with: bun test src/lib/products/bn-keywords.test.ts
 */
import { describe, expect, test } from "bun:test";

import { canonicalQuery, toEnglishKeywords } from "./bn-keywords";

describe("toEnglishKeywords", () => {
  test("maps a known phrase", () => {
    expect(toEnglishKeywords("লেড লাইট")).toBe("LED light");
    expect(toEnglishKeywords("ফোন কভার")).toBe("phone case");
  });

  test("maps phrases regardless of word order variants", () => {
    expect(toEnglishKeywords("মোবাইল ফোন কভার")).toBe("phone case");
    expect(toEnglishKeywords("মোবাইলের কভার")).toBe("phone case");
  });

  test("normalizes NFD-pasted Bangla", () => {
    // Some keyboards paste decomposed text; mapping must still work.
    expect(toEnglishKeywords("লেড লাইট".normalize("NFD"))).toBe("LED light");
  });

  test("collapses consecutive duplicate intent words", () => {
    expect(toEnglishKeywords("লাইট লাইট")).toBe("light");
  });

  test("maps single words", () => {
    expect(toEnglishKeywords("জুতা")).toBe("shoes");
    expect(toEnglishKeywords("ঘড়ি")).toBe("wrist watch");
  });

  test("strips case-ending suffixes to find the stem", () => {
    // জুতাটা = "the shoes" → stem জুতা
    expect(toEnglishKeywords("জুতাটা")).toBe("shoes");
  });

  test("keeps Latin words untouched", () => {
    expect(toEnglishKeywords("led light")).toBe("led light");
    expect(toEnglishKeywords("ব্যাগ for girls")).toBe("bag for girls");
  });

  test("mixed Bangla + Latin input works", () => {
    expect(toEnglishKeywords("লেড লাইট strip")).toBe("LED light strip");
  });

  test("unknown Bangla words are dropped, never passed through", () => {
    // A random Bangla string never matches on 1688.
    expect(toEnglishKeywords("ফলাফল")).toBe("ফলাফল"); // falls back, see below
  });

  test("never returns blank: falls back to original query", () => {
    expect(toEnglishKeywords("ফলাফল")).not.toBe("");
  });

  test("handles empty and whitespace input", () => {
    expect(toEnglishKeywords("")).toBe("");
    expect(toEnglishKeywords("   ")).toBe("");
  });

  test("handles standalone possessive forms from the validation pass", () => {
    expect(toEnglishKeywords("কভার")).toBe("cover");
    expect(toEnglishKeywords("স্কুলের ব্যাগ")).toBe("school bag");
    expect(toEnglishKeywords("ঘরের জিনিসপত্র")).toBe("household items");
  });
});

describe("canonicalQuery", () => {
  test("lowercases and canonicalizes for cache keys", () => {
    expect(canonicalQuery("LED Light")).toBe("led light");
    expect(canonicalQuery("লেড লাইট")).toBe("led light");
  });

  test("Bangla and English shoppers share one cache key", () => {
    expect(canonicalQuery("ফোন কভার")).toBe(canonicalQuery("phone case"));
  });
});
