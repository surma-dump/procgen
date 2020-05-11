#![no_main]
use algebra::matrix::Matrix4;
use algebra::vector::Vector4;
use js_bridge::JSVal;
use js_bridge_macro::js_bridge_function;

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

#[js_bridge_function]
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
