// @generated automatically by Diesel CLI.

diesel::table! {
    accounts (id) {
        id -> Integer,
        name -> Text,
        #[sql_name = "type"]
        type_ -> Text,
        currency -> Text,
        balance_cents -> BigInt,
        created_at -> Text,
        is_closed -> Integer,
    }
}

diesel::table! {
    budget_allocations (category, month) {
        category -> Integer,
        month -> Text,
        assigned_cents -> BigInt,
    }
}

diesel::table! {
    categories (id) {
        id -> Integer,
        name -> Text,
    }
}

diesel::table! {
    payees (id) {
        id -> Integer,
        name -> Text,
    }
}

diesel::table! {
    transactions (id) {
        id -> Integer,
        account -> Integer,
        date -> Text,
        payee -> Nullable<Integer>,
        category -> Nullable<Integer>,
        memo -> Nullable<Text>,
        amount_cents -> BigInt,
        cleared -> Integer,
    }
}

diesel::joinable!(budget_allocations -> categories (category));
diesel::joinable!(transactions -> accounts (account));
diesel::joinable!(transactions -> categories (category));
diesel::joinable!(transactions -> payees (payee));

diesel::allow_tables_to_appear_in_same_query!(
    accounts,
    budget_allocations,
    categories,
    payees,
    transactions,
);
