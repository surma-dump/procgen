use std::convert::{From, Into};

#[repr(C, u8)]
pub enum JSVal {
    Uint8Slice(*mut [u8]),
    Uint16Slice(*mut [u16]),
    Uint32Slice(*mut [u32]),
    Int8Slice(*mut [i8]),
    Int16Slice(*mut [i16]),
    Int32Slice(*mut [i32]),
    Float32Slice(*mut [f32]),
    Float64Slice(*mut [f64]),
}

macro_rules! maybe_drop_slice {
    ($self:ident, $type_name:ident, $type:ident) => {
        if let JSVal::$type_name(slice_ptr) = $self {
            unsafe {
                Box::<[$type]>::from_raw(*slice_ptr);
            }
        }
    };
}

impl Drop for JSVal {
    fn drop(&mut self) {
        maybe_drop_slice!(self, Uint8Slice, u8);
        maybe_drop_slice!(self, Uint16Slice, u16);
        maybe_drop_slice!(self, Uint32Slice, u32);
        maybe_drop_slice!(self, Int8Slice, i8);
        maybe_drop_slice!(self, Int16Slice, i16);
        maybe_drop_slice!(self, Int32Slice, i32);
        maybe_drop_slice!(self, Float32Slice, f32);
        maybe_drop_slice!(self, Float64Slice, f64);
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
