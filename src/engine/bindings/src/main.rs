#![no_main]
use algebra::matrix::Matrix4;
use algebra::vector::Vector4;
use std::convert::{From, Into};
use std::ops::Drop;

struct Camera {
    pub position: Vector4,
    pub head: f32,
    pub pitch: f32,
    pub roll: f32,
    pub fov_y: f32,
    pub aspect: f32,
    pub far: f32,
    pub near: f32,
}

impl Camera {
    pub fn new() -> Camera {
        Camera {
            position: Vector4::with_values(0., 0., 0., 1.),
            head: 0.,
            pitch: 0.,
            roll: 0.,
            fov_y: 50.,
            aspect: 1.,
            far: 1e9,
            near: 0.01,
        }
    }

    pub fn transform(self: &Self) -> Matrix4 {
        Matrix4::perspective(self.fov_y, self.aspect, self.near, self.far)
            * Matrix4::euler(self.head, self.pitch, self.roll)
            * Matrix4::translation_vector(&self.position)
    }
}

#[repr(C, u8)]
pub enum JSVal {
    Float32Slice(*mut [f32]),
}

impl Drop for JSVal {
    fn drop(&mut self) {
        match self {
            JSVal::Float32Slice(slice_ptr) => unsafe {
                Box::<[f32]>::from_raw(*slice_ptr);
            },
        };
    }
}

impl Into<JSVal> for &[f32] {
    fn into(self) -> JSVal {
        let copy: *mut [f32] = Box::into_raw(Box::<[f32]>::from(self));
        JSVal::Float32Slice(copy)
    }
}

impl Into<usize> for JSVal {
    fn into(self: Self) -> usize {
        let b: Box<JSVal> = self.into();
        Box::into_raw(b) as usize
    }
}

impl From<usize> for JSVal {
    fn from(ptr: usize) -> Self {
        let b: Box<JSVal> = unsafe { Box::from_raw(ptr as *mut JSVal) };
        *b
    }
}

#[no_mangle]
pub fn get_camera_matrix() -> usize {
    let v: JSVal = {
        let c = Camera::new();
        let transform = c.transform();
        (&transform.fields as &[f32]).into()
    };
    v.into()
}

#[no_mangle]
pub unsafe fn free(v: usize) {
    let val: JSVal = JSVal::from(v);
    drop(val);
}
