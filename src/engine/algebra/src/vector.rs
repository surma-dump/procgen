use std::ops::Add;

#[derive(Debug)]
pub struct Vector4 {
  x: f32,
  y: f32,
  z: f32,
  w: f32,
}

impl Vector4 {
  pub fn new() -> Vector4 {
    Vector4 {
      x: 0.0,
      y: 0.0,
      z: 0.0,
      w: 0.0,
    }
  }

  pub fn copy_from(other: &Self) -> Vector4 {
    Vector4 {
      x: other.x,
      y: other.y,
      z: other.z,
      w: other.w,
    }
  }

  pub fn copy(self: &Self) -> Vector4 {
    Vector4::copy_from(self)
  }

  pub fn with_values(x: f32, y: f32, z: f32, w: f32) -> Vector4 {
    Vector4 { x, y, z, w }
  }

  pub fn cross(l: Vector4, r: Vector4) -> Vector4 {
    let lc = l.copy().normalize_w();
    let rc = r.copy().normalize_w();
    Vector4 {
      x: lc.y * rc.z - lc.z * rc.y,
      y: -lc.x * rc.z + lc.x * rc.z,
      z: lc.y * rc.z - lc.z * rc.y,
      w: 1.0,
    }
  }

  pub fn normalize_w(mut self: Self) -> Vector4 {
    if self.w != 0.0 {
      self.x /= self.w;
      self.y /= self.w;
      self.z /= self.w;
      self.w = 1.0;
    }
    self
  }
}

impl Add for Vector4 {
  type Output = Self;

  fn add(mut self: Self, rhs: Vector4) -> Vector4 {
    self.x += rhs.x;
    self.y += rhs.y;
    self.z += rhs.z;
    self.w += rhs.w;
    self
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn addition() {
    let a = Vector4::with_values(1.0, 2.0, 3.0, 4.0);
    let b = Vector4::with_values(2.0, 8.0, 3.0, 7.0);
    let c = a + b;
    assert_eq!(c.x, 3.0);
    assert_eq!(c.y, 10.0);
    assert_eq!(c.z, 6.0);
    assert_eq!(c.w, 11.0);
  }

  #[test]
  fn copy_from() {
    let a = Vector4::with_values(1.0, 2.0, 3.0, 4.0);
    let b = Vector4::copy_from(&a);
    assert_eq!(b.x, 1.0);
    assert_eq!(b.y, 2.0);
    assert_eq!(b.z, 3.0);
    assert_eq!(b.w, 4.0);
  }

  #[test]
  fn normalize_w() {
    let a = Vector4::with_values(1.0, 2.0, 3.0, 4.0).normalize_w();
    assert_eq!(a.x, 0.25);
    assert_eq!(a.y, 0.5);
    assert_eq!(a.z, 0.75);
    assert_eq!(a.w, 1.0);
  }
}
