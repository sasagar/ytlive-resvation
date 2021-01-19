const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'youtube.json';

export default class Google {
  constructor() {
    this.secret_file = '';
    this.oauth = '';
    this.livelist = '';
  }

  get secret_file() { return this._secret_file; }

  set secret_file(filename) { this._secret_file = filename; }

  get oauth() { return this._oauth; }

  set oauth(value) { this._oauth = value; }

  get livelist() { return this._livelist; }

  set livelist(value) { this._livelist = value; }


  auth() {
    fs.readFile(
      this._secret_file,
      async (err, content) => {
        if (err) {
          console.log('Error loading client secret file: ' + err);
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        this.authorize(JSON.parse(content), this.getChannel);
      }
    );
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        this.getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        this._oauth = oauth2Client;
        callback(oauth2Client);
      }
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback to call with the authorized
   *     client.
   */
  getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        this.storeToken(token);
        callback(oauth2Client);
      });
    });
  }

  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) throw err;
      console.log('Token stored to ' + TOKEN_PATH);
    });
  }

  /**
   * Lists the names and IDs of up to 10 files.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  getChannel(auth = this._oauth) {
    var service = google.youtube('v3');

    return new Promise((res, rej) => {
      service.liveBroadcasts.list({
        auth: auth,
        part: 'id,snippet,contentDetails,status',
        broadcastStatus: 'upcoming',
        mime: true
      }, (err, response) => {
        if (err) {
          console.log('The API returned an error: ' + err);
          rej(err);
        }
        res(response.data.items);
      });
    }).then((response) => {
      this._livelist = response;
    }).then(() => {
      if (this._livelist.length == 0) {
        console.log('No live found.');
      } else {
        return this._livelist;
      }
    }).catch((e) => {
      console.error(e);
    });
  }
}