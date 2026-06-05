const { Client } = require('pg');

async function fix() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'microfinance'
  });
  await client.connect();

  const res = await client.query(`SELECT id, "centreId" FROM "users" WHERE role = 'customer' AND "customerCode" IS NULL`);
  const users = res.rows;
  
  for (const user of users) {
    // 1. increment sequence
    const seqRes = await client.query(`
      UPDATE centre_sequences 
      SET "currentValue" = "currentValue" + 1 
      WHERE "centreId" = $1 AND "type" = 'customer'
      RETURNING "currentValue", "centreCode"
    `, [user.centreId]);
    
    if (seqRes.rows.length > 0) {
      const row = seqRes.rows[0];
      const num = String(row.currentValue).padStart(5, '0');
      const code = `${row.centreCode}-C${num}`;
      
      // 2. update user
      await client.query(`UPDATE "users" SET "customerCode" = $1 WHERE id = $2`, [code, user.id]);
      console.log(`Updated user ${user.id} with code ${code}`);
    }
  }
  
  console.log('Done!');
  await client.end();
}

fix().catch(console.error);
