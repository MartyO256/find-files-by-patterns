import { assert } from "chai";

import { ofBasename } from "../src";

describe("ofBasename()", () => {
  it("should arbitrarily return `false` if no base names are given", () => {
    assert.isFalse(ofBasename()(""));
  });
  it("should return `true` if a path's base name matches a string base name", () => {
    assert.isTrue(ofBasename("file.md")("/home/user/file.md"));
  });
  it("should return `false` if a path's base name does not match a string base name", () => {
    assert.isFalse(ofBasename("file.md")("/home/user/file.html"));
  });
  it("should return `true` if a path's base name matches a regular expression pattern", () => {
    const matcher = ofBasename(/^file\..*$/);
    assert.isTrue(matcher("/home/user/file.md"));
    assert.isTrue(matcher("/home/user/file.html"));
  });
  it("should return `false` if a path's base name does not match a regular expression pattern", () => {
    const matcher = ofBasename(/^data\..*$/);
    assert.isFalse(matcher("/home/user/file.md"));
    assert.isFalse(matcher("/home/user/file.html"));
  });
});
