use proc_macro::TokenStream;
use quote::quote;
use quote::ToTokens;
use syn::{parse_macro_input, FnArg, ItemFn, ReturnType};

// fn generate_function_arguments(args: Punctuated<FnArg, Comma>) -> TokenStream

#[proc_macro_attribute]
pub fn js_bridge_function(_attr: TokenStream, item: TokenStream) -> TokenStream {
    let input = parse_macro_input!(item as ItemFn);
    let name = input.sig.ident;
    let new_args: Vec<proc_macro2::TokenStream> = input
        .sig
        .inputs
        .iter()
        .map(|arg| match arg {
            FnArg::Receiver(_) => panic!("Can’t handle receivers just yet"),
            FnArg::Typed(typ) => {
                let arg_name = typ.pat.to_token_stream();
                match typ.ty.to_token_stream().to_string().as_str() {
                    "JSVal" => {
                        quote! {
                            #arg_name: usize
                        }
                    }
                    "f32" | "f64" | "u8" | "i8" | "u16" | "i16" | "u32" | "i32" => {
                        FnArg::Typed(typ.clone()).to_token_stream()
                    }
                    typ => panic!("Can’t handle data type {}", typ),
                }
            }
        })
        .collect();
    // println!(">> {:?}", new_args.iter().map(|v| v.to_string()).collect::<Vec<String>>());
    let body = input.block;
    let result = match input.sig.output {
        // Function with no return value
        ReturnType::Default => {
            quote! {
                pub fn #name(#(#new_args),*) {
                    #body
                }
            }
        }
        // Function with a return value
        // TODO: Actually validate if the return value is `JSVal`.
        ReturnType::Type(_, _) => {
            quote! {
                pub fn #name(#(#new_args),*) -> usize {
                    let v: JSVal = {
                        #body
                    };
                    v.into()
                }
            }
        }
    };
    TokenStream::from(result)
}
