#![no_main]

use js_bridge::JSVal;
use js_bridge_macro::js_bridge_function;

mod camera;
use camera::Camera; 

#[js_bridge_function]
pub fn get_camera_matrix() -> JSVal {
    let c = Camera::new();
    let transform = c.transform();
    (&transform.fields as &[f32]).into()
}

#[js_bridge_function]
pub fn free(v: JSVal) {
    drop(v);
}
