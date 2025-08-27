use diesel::prelude::*;
use serde::{Deserialize, Serialize};


#[derive(Queryable, Selectable, Deserialize, Serialize)]
#[diesel(table_name = crate::schema::transactions)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Transaction {
    pub id: i32,
    pub account: String,
    pub date: String,
    pub payee: String,
    pub amount_cents: i64,
}
