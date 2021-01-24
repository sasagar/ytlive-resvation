"use strict";

import { app, protocol, BrowserWindow, shell } from "electron";
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import Google from "./backend-modules/google";

// const readline = require("readline");

import ElectronStore from "electron-store";

import "./auto-update";

const schema = {
  queue: {
    type: "array",
    default: [],
  },
  timerInterval: {
    type: "number",
    minimum: 5000,
    default: 8000,
  },
  numberOfPlaying: {
    type: "number",
    minimum: 1,
    default: 3,
  },
  numberOfStandby: {
    type: "number",
    minimum: 0,
    default: 2,
  },
  reserveKeyword: {
    type: "string",
    format: "regex",
  },
};

const conf = new ElectronStore({ schema });

const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("OK");
});

const google = new Google();
const isDevelopment = process.env.NODE_ENV !== "production";

const PORT = 8081;

server.listen(PORT, () => {
  console.log(PORT + "でサーバーが起動しました");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      //nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: false,
      webSecurity: false,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    // createProtocol('app')
    // // Load the index.html when not in development
    // win.loadURL('app://./index.html')
    win.loadURL(`http://localhost:8080/`);
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  google.secret_file = "client_secret.json";
  const check = await google.authCheck();
  if (check) {
    google.auth();
    // console.log(google.getChannel());
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        await installExtension(VUEJS_DEVTOOLS);
      } catch (e) {
        console.error("Vue Devtools failed to install:", e.toString());
      }
    }
    createWindow();

    let lives;
    google.livelist = [];
    setTimeout(async () => {
      lives = await google.getChannel();
      win.webContents.send("test", JSON.stringify(lives));
    }, 5000);
  } else {
    const url = await google.authStep();
    shell.openExternal(url);

    createWindow();
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

io.on("connection", (socket) => {
  socket.on("liveListRequest", async () => {
    const lives = await google.getChannel();
    io.emit("liveListResponse", lives);
  });

  socket.on("setChatId", (liveChatId) => {
    google.liveChatId = liveChatId;
  });

  socket.on("getChatRequest", async (token) => {
    const data = await google.getChat(token);
    io.emit("getChatResponse", data);
  });

  // Save / Get config.
  socket.on("saveQueue", async (data) => {
    conf.set("queue", data);
    const response = await conf.get("queue", []);
    io.emit("getQueueResponseOnce", response);
  });

  socket.on("saveTimerInterval", (data) => {
    conf.set("timerInterval", data);
  });

  socket.on("saveNumberOfPlaying", (data) => {
    conf.set("numberOfPlaying", data);
  });

  socket.on("saveNumberOfStandby", (data) => {
    conf.set("numberOfStandby", data);
  });

  socket.on("saveReserveKeyword", (data) => {
    conf.set("reserveKeyword", data);
  });

  socket.on("getQueueRequest", async () => {
    const data = await conf.get("queue", []);
    io.emit("getQueueResponse", data);
  });

  socket.on("getTimerIntervalRequest", async () => {
    const data = await conf.get("timerInterval");
    io.emit("getTimerIntervalResponse", data);
  });

  socket.on("getNumberOfPlayingRequest", async () => {
    const data = await conf.get("numberOfPlaying");
    io.emit("getNumberOfPlayingResponse", data);
  });

  socket.on("getNumberOfStandbyRequest", async () => {
    const data = await conf.get("numberOfStandby");
    io.emit("getNumberOfStandbyResponse", data);
  });

  socket.on("getReserveKeywordRequest", async () => {
    const data = await conf.get("reserveKeyword");
    io.emit("getReserveKeywordResponse", data);
  });

  socket.on("sendReserveMessage", (data) => {
    google.sendMessage(data);
  });

  socket.on("setCode", async (data) => {
    const result = await google.authSecond(data);
    io.emit("setCodeResult", result);
  });

  socket.on("authCheck", async () => {
    const result = await google.authCheck();
    io.emit("authCheckResult", result);
  });

  socket.on("firstDisplayRequest", async () => {
    const result = await firstDisplayData();
    io.emit("firstDisplayResponse", result);
  });
});

const firstDisplayData = async () => {
  const queue = await conf.get("queue", []);
  const nop = await conf.get("numberOfPlaying", 3);
  const nos = await conf.get("numberOfStandby", 2);
  return { queue, numberOfPlaying: nop, numberOfStandby: nos };
};
