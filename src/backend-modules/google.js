const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube",
];
const TOKEN_DIR = ".credentials";
const TOKEN_PATH = path.join(TOKEN_DIR, "youtube.json");

export default class Google {
  constructor(userDir) {
    this.userDir = userDir;
    this.secret_file = "";
    this.secret_path = "";
    this.oauth = "";
    this.livelist = "";
    this.liveChatId = "";
  }

  get secret_file() {
    return this._secret_file;
  }

  set secret_file(filename) {
    this._secret_file = filename;
  }

  get secret_path() {
    return this._secret_path;
  }

  set secret_path(filepath) {
    this._secret_path = filepath;
  }

  get oauth() {
    return this._oauth;
  }

  set oauth(value) {
    this._oauth = value;
  }

  get livelist() {
    return this._livelist;
  }

  set livelist(value) {
    this._livelist = value;
  }

  get liveChatId() {
    return this._liveChatId;
  }

  set liveChatId(value) {
    this._liveChatId = value;
  }

  secretCheck() {
    return new Promise((res, rej) => {
      fs.readFile(this._secret_file, (err) => {
        if (err) {
          rej(false);
        }
        res(true);
      });
    }).catch((e) => console.log(e));
  }

  authCheck() {
    return new Promise((res, rej) => {
      fs.readFile(path.join(this.userDir, TOKEN_PATH), (err) => {
        if (err) {
          res(false);
        } else {
          res(true);
        }
        rej(false);
      });
    });
  }

  auth() {
    if (!process.env.IS_TEST) {
      this.secret_path = this._secret_file;
    } else {
      this.secret_path = path.join(__dirname, this._secret_file);
    }
    fs.readFile(this._secret_path, async (err, content) => {
      if (err) {
        console.log("Error loading client secret file: " + err);
      }
      // Authorize a client with the loaded credentials, then call the YouTube API.
      this.authorize(JSON.parse(content), this.getChannel);
    });
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
    fs.readFile(path.join(this.userDir, TOKEN_PATH), (err, token) => {
      if (err) {
        this.getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        this._oauth = oauth2Client;
        callback(oauth2Client);
      }
    });
  }

  authStep() {
    return new Promise((res, rej) => {
      if (!process.env.IS_TEST) {
        this.secret_path = this._secret_file;
      } else {
        this.secret_path = path.join(__dirname, this._secret_file);
      }
      fs.readFile(this._secret_path, async (err, content) => {
        if (err) {
          rej(err);
        }
        const credentials = JSON.parse(content);
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[0];
        const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

        const authUrl = oauth2Client.generateAuthUrl({
          access_type: "offline",
          scope: SCOPES,
        });
        res(authUrl);
      });
    }).catch((e) => {
      console.error(e);
    });
  }

  authSecond(code) {
    return new Promise((res, rej) => {
      fs.readFile(this._secret_file, async (err, content) => {
        const credentials = JSON.parse(content);
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[0];
        const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

        oauth2Client.getToken(code, (err, token) => {
          if (err) {
            console.log("Error while trying to retrieve access token", err);
            rej(false);
          }
          oauth2Client.credentials = token;
          this.storeToken(token);
          this._oauth = oauth2Client;
          res(true);
        });
      });
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
      access_type: "offline",
      scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url: ", authUrl);

    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.log("Error while trying to retrieve access token", err);
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
      fs.mkdirSync(path.join(this.userDir, TOKEN_DIR));
    } catch (err) {
      if (err.code != "EEXIST") {
        throw err;
      }
    }
    fs.writeFile(
      path.join(this.userDir, TOKEN_PATH),
      JSON.stringify(token),
      (err) => {
        if (err) throw err;
        console.log("Token stored to " + path.join(this.userDir, TOKEN_PATH));
      }
    );
  }

  /**
   * Lists the names and IDs of up to 10 files.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  getChannel(auth = this._oauth, status = "upcoming") {
    var service = google.youtube("v3");

    return new Promise((res, rej) => {
      service.liveBroadcasts.list(
        {
          auth: auth,
          part: "id,snippet,contentDetails,status",
          broadcastStatus: status,
          mime: true,
        },
        (err, response) => {
          if (err) {
            console.log("The API returned an error: " + err);
            rej(err);
          }
          try {
            res(response.data.items);
          } catch (e) {
            rej(e);
          }
        }
      );
    })
      .then((items) => {
        if (items.length == 0) {
          console.log("No live found.");
          return [];
        } else {
          return items;
        }
      })
      .catch((e) => {
        console.error(e);
        return [];
      });
  }

  /**
   * Get list of chats.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  getChat(pageToken = "", id = this._liveChatId, auth = this._oauth) {
    var service = google.youtube("v3");

    return new Promise((res, rej) => {
      service.liveChatMessages.list(
        {
          auth: auth,
          part: "id, snippet, authorDetails",
          pageToken,
          liveChatId: id,
        },
        (err, response) => {
          if (err) {
            console.log("The API returned an error: " + err);
            rej(err);
          }
          res(response.data);
        }
      );
    }).catch((e) => {
      console.error(e);
    });
  }

  /**
   * Send message.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   * @param liveChatId
   * @param message
   */
  sendMessage(message = "", id = this._liveChatId, auth = this._oauth) {
    var service = google.youtube("v3");

    return new Promise((res, rej) => {
      service.liveChatMessages.insert(
        {
          auth: auth,
          part: "snippet",
          requestBody: {
            snippet: {
              liveChatId: id,
              type: "textMessageEvent",
              textMessageDetails: {
                messageText: message,
              },
            },
          },
        },
        (err, response) => {
          if (err) {
            console.log("The API returned an error: " + err);
            rej(err);
          }
          res(response);
        }
      );
    }).catch((e) => {
      console.error(e);
    });
  }
}
