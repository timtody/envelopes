pub mod models;
pub mod schema;

use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dotenvy::dotenv;
use std::env;
use tauri::{Manager, State};

type Pool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

pub struct Db {
    pub pool: Pool,
}

// Embed everything from /migrations at compile time:
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

fn get_txns(db: State<Db>) -> Result<Vec<models::Transaction>, String> {
    use schema::transactions::dsl::*;
    let mut conn = db.pool.get().map_err(|e: ::r2d2::Error| e.to_string())?;
    transactions
        .order(date.asc())
        .load::<models::Transaction>(&mut conn)
        .map_err(|e| e.to_string())
}

fn list_txns_by_month(
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
    let mut conn = db.pool.get().map_err(|e| e.to_string())?;
    transactions
        .filter(date.ge(start).and(date.lt(end)))
        .order(date.asc())
        .load::<models::Transaction>(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_txn_cmd(
    db: State<Db>,
    account_name: String,
    date: String,
    payee_name: String,
    category: Option<i32>,
    memo: Option<String>,
    amount_cents: i64,
) -> Result<(), String> {
    use schema::{accounts, payees, transactions};
    let mut conn = db.pool.get().map_err(|e| e.to_string())?;

    // First get the account_id
    let account_id = accounts::dsl::accounts
        .filter(accounts::name.eq(&account_name))
        .select(accounts::id)
        .first::<i32>(&mut conn)
        .map_err(|e| e.to_string())?;

    // Try to find payee first, if not found create it
    let payee_id = match payees::dsl::payees
        .filter(payees::name.eq(&payee_name))
        .select(payees::id)
        .first::<i32>(&mut conn)
    {
        Ok(id) => id,
        Err(diesel::NotFound) => {
            // Payee doesn't exist, create it
            diesel::insert_into(payees::table)
                .values(payees::name.eq(&payee_name))
                .returning(payees::id)
                .get_result(&mut conn)
                .map_err(|e| e.to_string())?
        }
        Err(e) => return Err(e.to_string()),
    };

    // Create the transaction with the payee_id
    diesel::insert_into(transactions::table)
        .values((
            transactions::account.eq(account_id),
            transactions::date.eq(date),
            transactions::payee.eq(payee_id),
            transactions::category.eq(category),
            transactions::memo.eq(memo),
            transactions::amount_cents.eq(amount_cents),
            transactions::cleared.eq(0),
        ))
        .execute(&mut conn)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn list_txns_by_month_full_cmd(
    db: State<Db>,
    account_name: String,
    year: i32,
    month: u32,
) -> Result<Vec<models::TxnFull>, String> {
    use schema::v_transactions_full;

    let start = format!("{year:04}-{month:02}-01");
    let (ny, nm) = if month == 12 {
        (year + 1, 1)
    } else {
        (year, month + 1)
    };
    let end = format!("{ny:04}-{nm:02}-01");

    let mut conn = db.pool.get().map_err(|e| e.to_string())?;

    v_transactions_full::dsl::v_transactions_full
        .filter(v_transactions_full::account.eq(account_name))
        .filter(v_transactions_full::date.ge(&start))
        .filter(v_transactions_full::date.lt(&end))
        .order((
            v_transactions_full::date.desc(),
            v_transactions_full::id.asc(),
        ))
        .load::<models::TxnFull>(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn list_txns(db: State<Db>, year: i32) -> Result<Vec<models::TxnFull>, String> {
    use schema::v_transactions_full;
    let mut conn = db.pool.get().map_err(|e| e.to_string())?;
    v_transactions_full::dsl::v_transactions_full
        .order((
            v_transactions_full::date.desc(),
            v_transactions_full::id.asc(),
        ))
        .limit(100)
        .load::<models::TxnFull>(&mut conn)
}

#[tauri::command]
fn list_accounts_cmd(db: State<Db>) -> Result<Vec<models::Account>, String> {
    use schema::accounts::dsl::*;
    let mut conn = db.pool.get().map_err(|e| e.to_string())?;
    accounts
        .order(name.asc())
        .load::<models::Account>(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn list_categories_cmd(db: State<Db>) -> Result<Vec<models::Category>, String> {
    use schema::categories::dsl::*;
    let mut conn = db.pool.get().map_err(|e| e.to_string())?;
    categories
        .order(name.asc())
        .load::<models::Category>(&mut conn)
        .map_err(|e| e.to_string())
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
            let pool = r2d2::Pool::builder()
                .max_size(
                    env::var("MAX_POOL_SIZE")
                        .expect("MAX_POOL_SIZE must be set")
                        .parse::<u32>()
                        .ok()
                        .expect("MAX_POOL_SIZE must be a valid u32"),
                )
                .build(manager)?;

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

            if !app.manage(Db { pool: pool }) {
                return Err("Failed to manage database state".into());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_txn_cmd,
            list_txns_by_month_full_cmd,
            list_accounts_cmd,
            list_categories_cmd,
            list_txns
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
