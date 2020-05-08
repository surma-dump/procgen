#![no_main]
use algebra::matrix::Matrix4;
use algebra::vector::Vector4;

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

#[no_mangle]
pub fn do_a_thing() -> usize {
    let c = Camera::new();
    let transform = c.transform();
    &transform.fields[0] as *const f32 as *const () as usize
    // let a = Matrix4::identity() * 9.0;
    // let b = Matrix4::identity();
    // let c = a + b;
    // c.get(1, 1).unwrap()
}
