import { google } from 'googleapis';
import * as readline from 'readline';

const oauth2Client = new google.auth.OAuth2(
  'process.env.GOOGLE_CLIENT_ID',
  'process.env.GOOGLE_CLIENT_SECRET',
  'http://localhost'
);

const scopes = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
});

console.log('Authorize this app by visiting this URL:\n');
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nEnter the code here: ', async (code) => {
  const { tokens } = await oauth2Client.getToken(code);

  console.log('\nREFRESH TOKEN:\n');
  console.log(tokens.refresh_token);

  rl.close();
});