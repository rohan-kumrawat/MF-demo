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

  const getCode = (centreId) => {
    if (centreId === '7e8667c6-d555-4d20-b9b4-241065ef4750') return 'SS';
    if (centreId === '1c34dc23-daf4-4b6d-8254-d4a232430721') return 'GK';
    return 'DEF';
  };

  // 1. Update centre_sequences
  const seqRes = await client.query('SELECT id, "centreId" FROM centre_sequences');
  for (const row of seqRes.rows) {
    await client.query('UPDATE centre_sequences SET "centreCode" = $1 WHERE id = $2', [getCode(row.centreId), row.id]);
  }

  // 2. Update users.customerCode
  const usersRes = await client.query('SELECT id, "centreId", "customerCode" FROM users WHERE "customerCode" IS NOT NULL');
  for (const row of usersRes.rows) {
    if (row.customerCode.includes('-')) {
      const newCode = getCode(row.centreId) + '-' + row.customerCode.split('-').slice(1).join('-');
      await client.query('UPDATE users SET "customerCode" = $1 WHERE id = $2', [newCode, row.id]);
    }
  }

  // 3. Update loans.loanAccountNumber
  const loansRes = await client.query('SELECT id, "centreId", "loanAccountNumber" FROM loans WHERE "loanAccountNumber" IS NOT NULL');
  for (const row of loansRes.rows) {
    if (row.loanAccountNumber.includes('-')) {
      const newCode = getCode(row.centreId) + '-' + row.loanAccountNumber.split('-').slice(1).join('-');
      await client.query('UPDATE loans SET "loanAccountNumber" = $1 WHERE id = $2', [newCode, row.id]);
    }
  }

  // 4. Update loan_transactions.receiptNo
  const loanTxRes = await client.query('SELECT id, "centreId", "receiptNo" FROM loan_transactions WHERE "receiptNo" IS NOT NULL');
  for (const row of loanTxRes.rows) {
    if (row.receiptNo.includes('-')) {
      const newCode = getCode(row.centreId) + '-' + row.receiptNo.split('-').slice(1).join('-');
      await client.query('UPDATE loan_transactions SET "receiptNo" = $1 WHERE id = $2', [newCode, row.id]);
    }
  }

  // 5. Update diary_accounts.accountCode
  const diaryAccRes = await client.query('SELECT id, "centreId", "accountCode" FROM diary_accounts WHERE "accountCode" IS NOT NULL');
  for (const row of diaryAccRes.rows) {
    if (row.accountCode.includes('-')) {
      const newCode = getCode(row.centreId) + '-' + row.accountCode.split('-').slice(1).join('-');
      await client.query('UPDATE diary_accounts SET "accountCode" = $1 WHERE id = $2', [newCode, row.id]);
    }
  }

  // 6. Update udhar_persons.personCode
  const udharRes = await client.query('SELECT id, "centreId", "personCode" FROM udhar_persons WHERE "personCode" IS NOT NULL');
  for (const row of udharRes.rows) {
    if (row.personCode.includes('-')) {
      const newCode = getCode(row.centreId) + '-' + row.personCode.split('-').slice(1).join('-');
      await client.query('UPDATE udhar_persons SET "personCode" = $1 WHERE id = $2', [newCode, row.id]);
    }
  }

  console.log('Successfully updated all codes!');
  await client.end();
}

fix().catch(console.error);
