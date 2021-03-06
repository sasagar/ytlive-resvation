"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  Menu,
  shell,
  screen,
  dialog,
} from "electron";
// import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import Google from "./backend-modules/google";
import { template, darwinTemplate } from "./backend-modules/electronMenu";

const path = require("path");
const mime = require("mime");

const fs = require("fs");

import ElectronStore from "electron-store";

import "./auto-update";

const userDir = app.getPath("userData");

const secret_file = path.join(userDir, "./client_secret.json");

const DEFAULT_WINDOW_SIZE = [800, 600];

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
    default: "",
  },
  cancelKeyword: {
    type: "string",
    default: "",
  },
};

const conf = new ElectronStore({ schema });

const google = new Google(userDir);
const isDevelopment = process.env.NODE_ENV !== "production";

const http = require("http");

const server = http.createServer();
server.on("request", (req, res) => {
  let reqpath = req.url;
  if (reqpath === "/") {
    reqpath = "/index.html";
  }
  // let stream = fs.createReadStream(path.join(__static, reqpath));
  let stream = fs.readFileSync(path.join(__static, reqpath));
  let ext = reqpath.substr(reqpath.lastIndexOf(".") + 1);
  res.writeHead(200, {
    "Content-Type": mime.getType(ext),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(stream);
  // stream.pipe(stream);
  // res.end();
});

const PORT = 8081;

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

server.listen(PORT);

let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  const pos = conf.get("window.pos") || getCenterPosition();
  const size = conf.get("window.size") || [800, 600];

  // Create the browser window.
  win = new BrowserWindow({
    width: size[0],
    height: size[1],
    x: pos[0],
    y: pos[1],
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
    // createProtocol("app");
    // // Load the index.html when not in development
    // win.loadURL("app://./index.html");
    win.loadURL(`file://${__static}/index.html`);
  }

  win.on("close", () => {
    conf.set("window.pos", win.getPosition()); // ウィンドウの座標を記録
    conf.set("window.size", win.getSize()); // ウィンドウのサイズを記録
  });

  if (process.platform === "darwin") {
    template.unshift(darwinTemplate.main);

    // Edit menu
    template[1].submenu = template[1].submenu.concat(
      template[1].submenu,
      darwinTemplate.sub1
    );

    // Window menu
    template[3].submenu = darwinTemplate.sub2;
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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
  google.secret_file = secret_file;

  const secretChk = await google.secretCheck();

  if (secretChk) {
    const check = await google.authCheck();
    if (check) {
      google.auth();
      if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
          await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
          console.error("Vue Devtools failed to install:", e.toString());
        }
      }
      createWindow();

      google.livelist = [];
    } else {
      authOpen();
      createWindow();
    }
  } else {
    createWindow();
  }
});

const authOpen = async () => {
  const url = await google.authStep();
  shell.openExternal(url);
};

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
    const activeLives = await google.getChannel(google.oauth, "active");
    const upcomingLives = await google.getChannel(google.oauth, "upcoming");
    const lives = activeLives.concat(upcomingLives);
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
    const count = data * 1;
    conf.set("numberOfPlaying", count);
    io.emit("getNumberOfPlayingResponseOnce", count);
  });

  socket.on("saveNumberOfStandby", (data) => {
    const count = data * 1;
    conf.set("numberOfStandby", count);
    io.emit("getNumberOfStandbyResponseOnce", count);
  });

  socket.on("saveReserveKeyword", (data) => {
    conf.set("reserveKeyword", data);
  });

  socket.on("saveCancelKeyword", (data) => {
    conf.set("cancelKeyword", data);
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

  socket.on("getCancelKeywordRequest", async () => {
    const data = await conf.get("cancelKeyword");
    io.emit("getCancelKeywordResponse", data);
  });

  socket.on("sendReserveMessage", (data) => {
    google.sendMessage(data);
  });

  socket.on("setCode", async (data) => {
    const result = await google.authSecond(data);
    io.emit("setCodeResult", result);
  });

  socket.on("checkSecret", async () => {
    const result = await google.secretCheck();
    io.emit("readSecret", result);
  });

  socket.on("authCheck", async () => {
    const result = await google.authCheck();
    io.emit("authCheckResult", result);
  });

  socket.on("firstDisplayRequest", async () => {
    const result = await firstDisplayData();
    io.emit("firstDisplayResponse", result);
  });

  socket.on("openSecretSelect", () => {
    dialog
      .showOpenDialog(win, {
        title: "Select client_secret.json",
        filters: [{ name: "JSON", extentions: ["json"] }],
        properties: ["openFile"],
      })
      .then((result) => {
        if (result.canceled) {
          io.emit("cancelFileRead");
        } else {
          const secret = fs.readFileSync(result.filePaths[0]);
          fs.writeFileSync(secret_file, secret);
          authOpen();
          io.emit("completeSecretSave");
        }
      })
      .catch((err) => {
        io.emit("errorSecret", err);
      });
  });
});

const firstDisplayData = async () => {
  const queue = await conf.get("queue", []);
  const nop = await conf.get("numberOfPlaying", 3);
  const nos = await conf.get("numberOfStandby", 2);
  return { queue, numberOfPlaying: nop, numberOfStandby: nos };
};

/**
 * ウィンドウの中央の座標を返却
 *
 * @return {array}
 */
function getCenterPosition() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const x = Math.floor((width - DEFAULT_WINDOW_SIZE[0]) / 2);
  const y = Math.floor((height - DEFAULT_WINDOW_SIZE[1]) / 2);
  return [x, y];
}
