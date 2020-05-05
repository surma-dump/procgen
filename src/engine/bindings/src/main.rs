#![no_main]

#[no_mangle] 
pub extern fn add(a: u32, b: u32) -> u32 {
    a + b
}
