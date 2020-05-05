use std::ops::{Add, Mul};

#[derive(Debug)]
pub struct Matrix4 {
    fields: [f32; 16],
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

    pub fn copy(other: &Self) -> Matrix4 {
        let mut result = Self::new();
        for (v, o) in result.fields.iter_mut().zip(&other.fields) {
            *v = *o;
        }
        result
    }

    pub fn get(self: &Self, x: usize, y: usize) -> f32 {
        self.fields[x * 4 + y]
    }

    pub fn set(self: &mut Self, x: usize, y: usize, v: f32) {
        self.fields[x * 4 + y] = v;
    }
}

impl Add for Matrix4 {
    type Output = Self;

    fn add(self: Self, rhs: Matrix4) -> Matrix4 {
        let mut result = Self::copy(&self);
        for (v, rhv) in result.fields.iter_mut().zip(&rhs.fields) {
            *v += rhv;
        }
        result
    }
}

impl Mul<f32> for Matrix4 {
    type Output = Self;

    fn mul(self: Self, rhs: f32) -> Matrix4 {
        let mut result = Self::copy(&self);
        for v in result.fields.iter_mut() {
            *v *= rhs;
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
                assert_eq!(c.get(x, y), if x == y { 2.0 } else { 0.0 });
            }
        }
    }

    #[test]
    fn multiplication() {
        let a = Matrix4::identity() * 9.0;
        for y in 0..4 {
            for x in 0..4 {
                assert_eq!(a.get(x, y), if x == y { 9.0 } else { 0.0 });
            }
        }
    }

    #[test]
    fn copy() {
        let mut a = Matrix4::identity();
        a.set(0, 0, 1337.0);
        let b = Matrix4::copy(&a);
        assert_eq!(b.get(0, 0), 1337.0);
    }
}
