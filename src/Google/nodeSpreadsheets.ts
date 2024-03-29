import * as fs from 'fs'
import * as readline from 'readline';
import { google } from 'googleapis';

// const readline = require('readline');
// const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = '../credentials/token.json';
const CREDENTIALS_PATH = '../credentials/credentials.json';

export function loadSpeadsheet(spreadsheetId: string, range: string) {
    // Load client secrets from a local file.
    return new Promise<string[][]>(resolve => {
        fs.readFile(CREDENTIALS_PATH, (err: any, content: any) => {
            if (err) { return console.log('Error loading client secret file:', err); }
            // Authorize a client with credentials, then call the Google Sheets API.
            authorize(JSON.parse(content), async (auth: any) => {
                const rows = await getRows(auth, spreadsheetId, range);
                resolve(rows);
            });
        });
    })
}
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: any, callback: any) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err: any, token: any) => {
        if (err) { return getNewToken(oAuth2Client, callback); }
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client: any, callback: any) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code: any) => {
        rl.close();
        oAuth2Client.getToken(code, (err: any, token: any) => {
            if (err) { return console.error('Error while trying to retrieve access token', err); }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (errToken: any) => {
                if (errToken) { console.error(errToken); }
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function getRows(auth: any, spreadsheetId: string, range: string) {
    return new Promise<string[][]>(r => {
        const sheets = google.sheets({ version: 'v4', auth });
        sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        }, (err: any, result: any) => {
            if (err) { return console.log('The API returned an error: ' + err); }
            if (result) {
                r(result.data.values);
            }
        });
    })

}