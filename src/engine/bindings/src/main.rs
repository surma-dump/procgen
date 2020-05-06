#![no_main]
use algebra::matrix::Matrix4;

struct Camera {}

#[no_mangle]
pub fn do_a_thing() -> f32 {
    let a = Matrix4::identity() * 9.0;
    let b = Matrix4::identity();
    let c = a + b;
    c.get(1, 1).unwrap()
}
