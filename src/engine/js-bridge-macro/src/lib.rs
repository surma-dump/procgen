use proc_macro::TokenStream;
use quote::quote;

#[proc_macro_attribute]
pub fn js_bridge_function(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(item as syn::ItemFn);
    let name = input.sig.ident;
    let body = input.block;
    let result = quote! {
        #[no_mangle]
        pub fn #name() -> usize {
            let v: JSVal = {
                #body
            };
            v.into()
        }
    };
    TokenStream::from(result)
}
