use std::f32;
use std::ops::{Add, Mul};

use super::vector::Vector4;

#[derive(Debug)]
pub struct Matrix4 {
    pub fields: [f32; 16],
}

impl Matrix4 {
    pub fn new() -> Matrix4 {
        Matrix4 { fields: [0.0; 16] }
    }

    pub fn identity() -> Matrix4 {
        let mut result = Self::new();
        for i in 0..4 {
            result.set(i, i, 1.0);
        }
        result
    }

    pub fn translation(x: f32, y: f32, z: f32) -> Matrix4 {
        let mut result = Self::identity();
        result.set(3, 0, x);
        result.set(3, 1, y);
        result.set(3, 2, z);
        result
    }

    pub fn translation_vector(v: &Vector4) -> Matrix4 {
        Self::translation(v.x, v.y, v.z)
    }

    pub fn rotation_x(angle: f32) -> Matrix4 {
        let mut result = Matrix4::identity();
        result.set(1, 1, angle.cos());
        result.set(2, 2, angle.cos());
        result.set(1, 2, angle.sin());
        result.set(2, 1, -angle.sin());
        result
    }

    pub fn rotation_y(angle: f32) -> Matrix4 {
        let mut result = Matrix4::identity();
        result.set(0, 0, angle.cos());
        result.set(2, 2, angle.cos());
        result.set(0, 2, -angle.sin());
        result.set(2, 0, angle.sin());
        result
    }

    pub fn rotation_z(angle: f32) -> Matrix4 {
        let mut result = Matrix4::identity();
        result.set(0, 0, angle.cos());
        result.set(1, 1, angle.cos());
        result.set(0, 1, angle.sin());
        result.set(1, 0, -angle.sin());
        result
    }

    pub fn euler(head: f32, pitch: f32, roll: f32) -> Matrix4 {
        Matrix4::rotation_y(head) * Matrix4::rotation_x(pitch) * Matrix4::rotation_z(roll)
    }

    pub fn perspective(fov_y: f32, aspect: f32, near: f32, far: f32) -> Matrix4 {
        let f: f32 = 1.0 / (fov_y / 2.0).tan();
        let mut result = Self::identity();
        result.set(0, 0, f / aspect);
        result.set(1, 1, f);
        result.set(2, 3, -1.0);
        let nf: f32 = 1.0 / (near - far);
        result.set(2, 2, (far + near) * nf);
        result.set(3, 2, 2.0 * far * near * nf);
        result.set(3, 3, 0.0);
        result
    }

    pub fn transpose(self: &mut Self) {
        for y in 0..4 {
            for x in y..4 {
                self.fields.swap(x * 4 + y, y * 4 + x);
            }
        }
    }

    pub fn transposed(self: &Self) -> Matrix4 {
        let mut result = self.copy();
        result.transpose();
        result
    }

    pub fn copy_from(other: &Self) -> Matrix4 {
        let mut result = Self::new();
        for (v, o) in result.fields.iter_mut().zip(&other.fields) {
            *v = *o;
        }
        result
    }

    pub fn copy(self: &Self) -> Matrix4 {
        Matrix4::copy_from(self)
    }

    pub fn get(self: &Self, x: usize, y: usize) -> Option<f32> {
        self.fields.get(x * 4 + y).copied()
    }

    pub fn set(self: &mut Self, x: usize, y: usize, new_val: f32) -> Option<()> {
        self.fields.get_mut(x * 4 + y).map(|v| *v = new_val)
    }
}

impl Add for Matrix4 {
    type Output = Self;

    fn add(mut self: Self, rhs: Matrix4) -> Matrix4 {
        for (v, rhv) in self.fields.iter_mut().zip(&rhs.fields) {
            *v += rhv;
        }
        self
    }
}

impl Mul<f32> for Matrix4 {
    type Output = Self;

    fn mul(mut self: Self, rhs: f32) -> Matrix4 {
        for v in self.fields.iter_mut() {
            *v *= rhs;
        }
        self
    }
}

impl Mul for Matrix4 {
    type Output = Matrix4;

    fn mul(self: Self, rhs: Matrix4) -> Matrix4 {
        let mut result = Matrix4::new();
        for y in 0..4 {
            for x in 0..4 {
                let mut sum: f32 = 0.0;
                for i in 0..4 {
                    sum += self.get(i, y).unwrap() * rhs.get(x, i).unwrap();
                }
                result.set(x, y, sum);
            }
        }
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn addition() {
        let a = Matrix4::identity();
        let b = Matrix4::identity();
        let c = a + b;
        for y in 0..4 {
            for x in 0..4 {
                assert_eq!(c.get(x, y).unwrap(), if x == y { 2.0 } else { 0.0 });
            }
        }
    }

    #[test]
    fn multiplication() {
        let a = Matrix4::identity() * 9.0;
        for y in 0..4 {
            for x in 0..4 {
                assert_eq!(a.get(x, y).unwrap(), if x == y { 9.0 } else { 0.0 });
            }
        }
    }

    #[test]
    fn copy_from() {
        let mut a = Matrix4::identity();
        a.set(0, 0, 1337.0);
        let b = Matrix4::copy_from(&a);
        assert_eq!(b.get(0, 0).unwrap(), 1337.0);
    }

    #[test]
    fn transpose() {
        let mut a = Matrix4::identity();
        a.set(0, 1, 4.0);
        a.set(4, 3, 5.0);
        let b = a.transposed();
        for y in 0..4 {
            for x in 0..4 {
                assert_eq!(a.get(x, y), b.get(y, x));
            }
        }
    }
}
