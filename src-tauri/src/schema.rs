// @generated automatically by Diesel CLI.

diesel::table! {
    transactions (id) {
        id -> Integer,
        account -> Text,
        date -> Text,
        payee -> Text,
        amount_cents -> BigInt,
    }
}
