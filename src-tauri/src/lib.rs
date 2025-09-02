pub mod models;
pub mod schema;

use crate::schema::{accounts, categories, payees, transactions};
use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use serde::{Deserialize, Serialize};
use std::env;
use tauri::{Manager, State};

type Pool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

pub struct Db(pub Pool);

// Embed everything from /migrations at compile time:
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

#[derive(Queryable, Deserialize, Serialize)]
pub struct TxnFull {
    pub id: i32,
    pub date: String,
    pub account_name: String,
    pub payee_name: Option<String>,
    pub category_name: Option<String>,
    pub memo: Option<String>,
    pub amount_cents: i64,
}

#[tauri::command]
fn list_txns_by_month_full(
    db: State<Db>,
    account_id: i32,
    year: i32,
    month: u32,
) -> Result<Vec<TxnFull>, String> {
    use accounts::dsl as a;
    use categories::dsl as c;
    use payees::dsl as p;
    use transactions::dsl as t;

    let start = format!("{year:04}-{month:02}-01");
    let (ny, nm) = if month == 12 {
        (year + 1, 1)
    } else {
        (year, month + 1)
    };
    let end = format!("{ny:04}-{nm:02}-01");

    let mut conn = db.0.get().map_err(|e| e.to_string())?;

    t::transactions
        .inner_join(a::accounts.on(a::id.eq(t::account)))
        .left_join(p::payees.on(p::id.nullable().eq(t::payee)))
        .left_join(c::categories.on(c::id.nullable().eq(t::category)))
        .filter(t::account.eq(account_id))
        .filter(t::date.ge(&start))
        .filter(t::date.lt(&end))
        .order((t::date.asc(), t::id.asc()))
        .select((
            t::id,
            t::date,
            a::name,
            p::name.nullable(),
            c::name.nullable(),
            t::memo.nullable(),
            t::amount_cents,
        ))
        .load::<TxnFull>(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_txns_cmd(db: State<Db>) -> Result<Vec<models::Transaction>, String> {
    use schema::transactions::dsl::*;
    let mut conn = db.0.get().map_err(|e: ::r2d2::Error| e.to_string())?;
    transactions
        .order(date.asc())
        .load::<models::Transaction>(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_txns_by_month_cmd(
    db: State<Db>,
    year: i32,
    month: i32,
) -> Result<Vec<models::Transaction>, String> {
    use schema::transactions::dsl::*;
    // Build [start, next_month) range as strings — SQLite TEXT date works well
    let start = format!("{year:04}-{month:02}-01");
    let (ny, nm) = if month == 12 {
        (year + 1, 1)
    } else {
        (year, month + 1)
    };
    let end = format!("{ny:04}-{nm:02}-01");

    println!("{} {}", start, end);
    let mut conn = db.0.get().map_err(|e| e.to_string())?;
    transactions
        .filter(date.ge(start).and(date.lt(end)))
        .order(date.asc())
        .load::<models::Transaction>(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_txn_cmd(
    db: State<Db>,
    account: i32,
    date: String,
    payee: i32,
    amount_cents: i64,
) -> Result<(), String> {
    use schema::transactions;
    let mut conn = db.0.get().map_err(|e| e.to_string())?;

    diesel::insert_into(transactions::table)
        .values((
            transactions::account.eq(account),
            transactions::date.eq(date),
            transactions::payee.eq(payee),
            transactions::amount_cents.eq(amount_cents),
        ))
        .execute(&mut conn)
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Initializes and runs the Tauri application, setting up the database and command handlers.
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // --- Where to store the DB file ---
            let app_data = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_data)?;

            dotenv().ok();
            let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

            // --- Build a small connection pool ---
            let manager = ConnectionManager::<SqliteConnection>::new(database_url);
            let pool = r2d2::Pool::builder().max_size(4).build(manager)?;

            {
                // --- One-time connection for PRAGMAs + migrations ---
                let mut conn = pool.get()?;
                // WAL must be set *outside* any transaction:
                let _ = diesel::sql_query("PRAGMA journal_mode=WAL;").execute(&mut conn);
                let _ = diesel::sql_query("PRAGMA foreign_keys=ON;").execute(&mut conn);

                // Run embedded migrations at startup:
                conn.run_pending_migrations(MIGRATIONS)
                    .map_err(|e| format!("migrations failed: {e}"))?;
            }

            if !app.manage(Db(pool)) {
                return Err("Failed to manage database state".into());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_txns_cmd,
            get_txns_by_month_cmd,
            create_txn_cmd,
            list_txns_by_month_full
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
