#![no_main]
 
use algebra::Matrix4;

#[no_mangle]
pub extern "C" fn do_a_thing() -> f32 {
    let a = Matrix4::identity() * 9.0;
    let b = Matrix4::identity();
    let c = a + b;
    c.get(1, 1)
}
