const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/microfinance' });
async function test() {
  const res = await pool.query('SELECT * FROM centres');
  console.log(res.rows);
  pool.end();
}
test();
