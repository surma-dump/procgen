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

// `JSVal` <-- to/from --> `usize` for easy pointer
// passing to JavaScript.

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

// Implement `Drop` to free up the internally held slices.

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

// Macro to implement `try_as_u8_slice` and `try_as_mut_u8_slice` for
// the supported slice types.
macro_rules! JSVal_borrow_impl {
    ($name:ident, $type_name:ident, $type:ident) => {
        impl JSVal {
            pub fn $name<'a>(&self) -> Option<&'a [$type]> {
                if let JSVal::$type_name(ptr) = self {
                    unsafe { Some(&**ptr) }
                } else {
                    None
                }
            }
        }
    };
}

macro_rules! JSVal_borrow_mut_impl {
    ($name:ident, $type_name:ident, $type:ident) => {
        impl JSVal {
            pub fn $name<'a>(&mut self) -> Option<&'a mut [$type]> {
                if let JSVal::$type_name(ptr) = self {
                    unsafe { Some(&mut **ptr) }
                } else {
                    None
                }
            }
        }
    };
}

JSVal_borrow_impl!(try_as_u8_slice, Uint8Slice, u8);
JSVal_borrow_mut_impl!(try_as_mut_u8_slice, Uint8Slice, u8);
JSVal_borrow_impl!(try_as_u16_slice, Uint16Slice, u16);
JSVal_borrow_mut_impl!(try_as_mut_u16_slice, Uint16Slice, u16);
JSVal_borrow_impl!(try_as_u32_slice, Uint32Slice, u32);
JSVal_borrow_mut_impl!(try_as_mut_u32_slice, Uint32Slice, u32);
JSVal_borrow_impl!(try_as_i8_slice, Int8Slice, i8);
JSVal_borrow_mut_impl!(try_as_mut_i8_slice, Int8Slice, i8);
JSVal_borrow_impl!(try_as_i16_slice, Int16Slice, i16);
JSVal_borrow_mut_impl!(try_as_mut_i16_slice, Int16Slice, i16);
JSVal_borrow_impl!(try_as_i32_slice, Int32Slice, i32);
JSVal_borrow_mut_impl!(try_as_mut_i32_slice, Int32Slice, i32);
JSVal_borrow_impl!(try_as_f32_slice, Float32Slice, f32);
JSVal_borrow_mut_impl!(try_as_mut_f32_slice, Float32Slice, f32);
JSVal_borrow_impl!(try_as_f64_slice, Float64Slice, f64);
JSVal_borrow_mut_impl!(try_as_mut_f64_slice, Float64Slice, f64);

// Macro to implement `Into` from `&[u8]` -> `JSVal`
// the supported slice types.
macro_rules! JSVal_Into_impl {
    ($type_name:ident, $type:ident) => {
        impl Into<JSVal> for &[$type] {
            fn into(self) -> JSVal {
                let copy: *mut [$type] = Box::into_raw(Box::<[$type]>::from(self));
                JSVal::$type_name(copy)
            }
        }
    };
}

JSVal_Into_impl!(Uint8Slice, u8);
JSVal_Into_impl!(Uint16Slice, u16);
JSVal_Into_impl!(Uint32Slice, u32);
JSVal_Into_impl!(Int8Slice, i8);
JSVal_Into_impl!(Int16Slice, i16);
JSVal_Into_impl!(Int32Slice, i32);
JSVal_Into_impl!(Float32Slice, f32);
JSVal_Into_impl!(Float64Slice, f64);

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test() {
        let my_slice = [1u8, 2u8, 3u8, 4u8];
        let my_val: JSVal = my_slice[..].into();
        let ptr: usize = my_val.into();
        let mut my_new_val: JSVal = ptr.into();

        let my_new_slice = my_new_val.try_as_u8_slice().unwrap();
        assert_eq!(my_slice.len(), my_new_slice.len());
        assert_eq!(my_slice[0], my_new_slice[0]);

        let my_new_slice = my_new_val.try_as_mut_u8_slice().unwrap();
        my_new_slice[0] = 9;
        assert_eq!(my_slice.len(), my_new_slice.len());
        assert_ne!(my_slice[0], my_new_slice[0]);
    }
}
