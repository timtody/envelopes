use diesel::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Deserialize, Serialize)]
#[diesel(table_name = crate::schema::transactions)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Transaction {
    pub id: i32,
    pub account: i32,
    pub date: String,
    pub payee: Option<i32>,
    pub category: Option<i32>,
    pub memo: Option<String>,
    pub amount_cents: i64,
    pub cleared: i32,
}

#[derive(Queryable, Selectable, Deserialize, Serialize)]
#[diesel(table_name = crate::schema::accounts)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Account {
    pub id: i32,
    pub name: String,
    pub type_: String,
    pub currency: String,
    pub balance_cents: i64,
    pub created_at: String,
    pub is_closed: i32,
}

#[derive(Queryable, Selectable, Deserialize, Serialize)]
#[diesel(table_name = crate::schema::payees)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Payee {
    pub id: i32,
    pub name: String,
}

#[derive(Queryable, Selectable, Deserialize, Serialize)]
#[diesel(table_name = crate::schema::categories)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Category {
    pub id: i32,
    pub name: String,
}