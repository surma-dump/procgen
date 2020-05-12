use proc_macro::TokenStream;
use quote::quote;
use quote::ToTokens;
use syn::punctuated::Punctuated;
use syn::spanned::Spanned;
use syn::{parse_macro_input, FnArg, ItemFn, ReturnType};

fn parse_args(
    args: Punctuated<FnArg, syn::token::Comma>,
) -> (Vec<proc_macro2::TokenStream>, Vec<proc_macro2::TokenStream>) {
    args.iter()
        .map(|arg| match arg {
            FnArg::Receiver(_) => panic!("Can’t handle receivers just yet"),
            FnArg::Typed(typ) => {
                let original_arg_name = typ.pat.to_token_stream();
                let wrapped_arg_name = syn::Ident::new(
                    &format!("_rawptr_{}", original_arg_name.to_string()),
                    typ.pat.span(),
                );
                let arg_type_name = typ.ty.to_token_stream().to_string();
                match arg_type_name.as_str() {
                    "JSVal" => (
                        quote! {
                            #wrapped_arg_name: usize
                        },
                        quote! {
                            let #original_arg_name: JSVal = #wrapped_arg_name.into();
                        },
                    ),
                    "f32" | "f64" | "u8" | "i8" | "u16" | "i16" | "u32" | "i32" => (
                        quote! {
                            #wrapped_arg_name: #arg_type_name
                        },
                        quote! {
                            let #original_arg_name = #wrapped_arg_name;
                        },
                    ),
                    _ => panic!("Can’t handle data type {}", arg_type_name),
                }
            }
        })
        .unzip()
}

#[proc_macro_attribute]
pub fn js_bridge_function(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as ItemFn);
    let name = input.sig.ident;
    let (new_arg_list, preambles) = parse_args(input.sig.inputs);
    let body = input.block;
    let result = match input.sig.output {
        // Function with no return value
        ReturnType::Default => quote! {
            #[no_mangle]
            pub fn #name(#(#new_arg_list),*) {
                #(#preambles);*
                #body
            }
        },
        // Function with a return value
        // TODO: Actually validate if the return value is `JSVal`.
        ReturnType::Type(_, _) => quote! {
            #[no_mangle]
            pub fn #name(#(#new_arg_list),*) -> usize {
                #(#preambles);*
                let v: JSVal = {
                    #body
                };
                v.into()
            }
        },
    };
    TokenStream::from(result)
}
