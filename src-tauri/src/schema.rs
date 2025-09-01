// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (id) {
        id -> Nullable<Integer>,
        name -> Text,
        #[sql_name = "type"]
        type_ -> Text,
        balance_cents -> BigInt,
        created_at -> Text,
    }
}

diesel::table! {
    transactions (id) {
        id -> Nullable<Integer>,
        account -> Text,
        date -> Text,
        payee -> Text,
        amount_cents -> BigInt,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    accounts,
    transactions,
);
