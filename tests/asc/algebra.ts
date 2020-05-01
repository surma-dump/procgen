import { Matrix4 } from "../../src/asc/algebra";

describe("Matrix4", () => {
  test("inverts identity correctly", () => {
    const id = new Matrix4().identity();
    const inverted = new Matrix4().invert(id);
    expect(id.equal(inverted)).toBeTruthy();
  });

  test("inverts identity correctly", () => {
    const id = new Matrix4().rotateX(.5);
    const inverted = new Matrix4().invert(id);
    const expected = new Matrix4().rotateX(-.5);
    expect(inverted.equal(expected)).toBeTruthy();
  });
});
