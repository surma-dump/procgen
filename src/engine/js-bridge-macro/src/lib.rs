use proc_macro::TokenStream;
use quote::quote;

#[proc_macro_attribute]
pub fn js_bridge_function(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(item as syn::ItemFn);
    let name: syn::Ident = input.sig.ident;
    let result = quote! {
        #[no_mangle]
        pub fn ohai() -> usize { 1337 }
    };
    TokenStream::from(result)
}
