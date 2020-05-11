use std::convert::{From, Into};

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
