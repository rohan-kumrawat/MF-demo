const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'microfinance',
});
client.connect()
  .then(() => client.query('ALTER TABLE udhar_entries ALTER COLUMN "interestAmount" DROP NOT NULL;'))
  .then(() => client.query('ALTER TABLE udhar_entries ALTER COLUMN "interestAmount" DROP DEFAULT;'))
  .then(() => console.log('Success'))
  .catch(e => console.error(e))
  .finally(() => client.end());
