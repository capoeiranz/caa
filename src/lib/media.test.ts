import { expect, describe, it } from "vitest"

import { safeParseFast } from "./media.fast.ts"
import { safeParsePath } from "./media.ts"

describe("safeParsePath", () => testFn(safeParsePath))
describe("safeParseFast", () => testFn(safeParseFast))

const testFn = (fn: typeof safeParsePath) => {
  describe("valid non-circular paths", () => {
    it("allows unrelated suffixes", () => {
      expect(fn("https://example.com/foo/a/foo", "/a/foo")).toBe("/a/foo")
    })

    it("allows shorter suffixes", () => {
      expect(fn("https://example.com/foo/baa/baa", "/baa")).toBe("/baa")
    })

    it("allows non-prefix overlap", () => {
      expect(fn("https://example.com/foo/baa/baa/foo", "/baa/foo")).toBe("/baa/foo")
    })

    it("allows sibling paths", () => {
      expect(fn("https://example.com/x/y/x", "/x")).toBe("/x")
    })

    it("allows partial overlaps", () => {
      expect(fn("https://example.com/x/y/x/z", "/x/z")).toBe("/x/z")
    })

    it("allows suffixes starting with later segments", () => {
      expect(fn("https://example.com/x/y/y", "/y")).toBe("/y")
    })

    it("allows deeper unrelated suffixes", () => {
      expect(fn("https://example.com/x/y/y/z", "/y/z")).toBe("/y/z")
    })

    it("ignores query strings", () => {
      expect(fn("https://example.com/foo/a/foo?x=1&y=2", "/a/foo")).toBe("/a/foo")
    })

    it("allows encoded characters", () => {
      expect(fn("https://example.com/foo/%E2%9C%93", "/%E2%9C%93")).toBe("/%E2%9C%93")
    })

    it("allows numbers", () => {
      expect(fn("https://example.com/foo/123", "/123")).toBe("/123")
    })

    it("allows file names", () => {
      expect(fn("https://example.com/foo/logo.png", "/logo.png")).toBe("/logo.png")
    })

    it("allows file names with queries", () => {
      expect(fn("https://example.com/foo/logo.png?w=foo", "/logo.png")).toBe("/logo.png")
    })
  })

  describe("circular references", () => {
    it("rejects identical path recursion", () => {
      expect(fn("https://example.com/foo/foo", "/foo")).toBeUndefined()
    })

    it("rejects nested recursion", () => {
      expect(fn("https://example.com/foo/foo/baa", "/foo/baa")).toBeUndefined()
    })

    it("rejects deeper nested recursion", () => {
      expect(fn("https://example.com/foo/foo/baa/ram", "/foo/baa/ram")).toBeUndefined()
    })

    it("rejects recursive prefix overlap", () => {
      expect(fn("https://example.com/x/y/x/y/z", "/x/y/z")).toBeUndefined()
    })

    it("rejects recursive nested prefix overlap", () => {
      expect(fn("https://example.com/x/y/x/y/z/a", "/x/y/z/a")).toBeUndefined()
    })

    it("rejects recursion with query strings", () => {
      expect(fn("https://example.com/foo/foo/bar?a=1", "/foo/bar")).toBeUndefined()
    })
  })

  describe("invalid urls", () => {
    it("rejects invalid URLs", () => {
      expect(fn("not a url", "/foo")).toBeUndefined()
    })

    it("rejects empty strings", () => {
      expect(fn("", "/foo")).toBeUndefined()
    })

    it("rejects relative URLs", () => {
      expect(fn("/foo/bar", "/bar")).toBeUndefined()
    })
  })

  describe("path validation", () => {
    it("rejects empty path", () => {
      expect(fn("https://example.com/foo/bar", "")).toBeUndefined()
    })

    it("rejects missing leading slash", () => {
      expect(fn("https://example.com/foo/bar", "bar")).toBeUndefined()
    })

    it("rejects when pathname does not end with suffix", () => {
      expect(fn("https://example.com/foo/bar", "/baz")).toBeUndefined()
    })

    it("rejects partial segment matches", () => {
      expect(fn("https://example.com/foo/barbaz", "/baz")).toBeUndefined()
    })

    it("rejects when suffix is longer than pathname", () => {
      expect(fn("https://example.com/foo", "/foo/bar")).toBeUndefined()
    })

    it("handles trailing slashes consistently", () => {
      expect(fn("https://example.com/foo/foo/bar/", "/foo/bar/")).toBeUndefined()
    })

    it("handles non-circular trailing slashes consistently", () => {
      expect(fn("https://example.com/foo/a/bar/", "/a/bar/")).toBe("/a/bar/")
    })
  })

  describe("edge cases", () => {
    it("ignores root-level paths", () => {
      expect(fn("https://example.com/foo", "/foo")).toBeUndefined()
    })

    it("rejects root recursion", () => {
      expect(fn("https://example.com/", "/")).toBeUndefined()
    })

    it("rejects repeated slashes if normalized as recursive", () => {
      expect(fn("https://example.com/foo//foo/bar", "/foo/bar")).toBeUndefined()
    })

    it("rejects partial segment suffix matches", () => {
      expect(fn("https://example.com/foo/barbaz", "/baz")).toBeUndefined()
    })

    it("handles long nested paths", () => {
      expect(fn("https://example.com/a/b/c/d/e/f/g", "/e/f/g")).toBe("/e/f/g")
    })

    it("rejects long recursive paths", () => {
      expect(fn("https://example.com/a/b/c/a/b/c/d", "/a/b/c/d")).toBeUndefined()
    })

    it("allows prefix in queries", () => {
      expect(fn("https://example.com/foo/baa?/foo", "/baa")).toBe("/baa")
    })
  })
}
