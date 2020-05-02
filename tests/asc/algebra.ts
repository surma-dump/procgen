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

  test("can be multiplied with a scalar", () => {
    const m = new Matrix4().identity().scalar(5);
    for(let y = 0; y < 4; y++) {
      for(let x = 0; x < 4; x++) {
        expect(m.get(x, y)).toBe(x === y ? 5 : 0);
      } 
    }
  });
});
