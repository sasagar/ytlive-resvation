<template>
  <div class="loading">
    <div class="atom-spinner">
      <div class="spinner-inner">
        <div class="spinner-line"></div>
        <div class="spinner-line"></div>
        <div class="spinner-line"></div>
        <!--Chrome renders little circles malformed :(-->
        <div class="spinner-circle">&#9679;</div>
      </div>
    </div>
    <h2>{{ status.msg }}</h2>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "Loading",
  computed: {
    ...mapState(["status"]),
    msg() {
      return this.status.msg;
    }
  },
  methods: {
    ...mapActions([
      "changeView",
      "setLives",
      "setQueue",
      "setTimerInterval",
      "setNumberOfPlaying",
      "setNumberOfStandby",
      "setReserveKeyword"
    ])
  },
  async mounted() {
    console.log("App/mounted");
    socket.emit("checkSecret");

    socket.on("authCheckResult", res => {
      if (res) {
        // Live list request for Electron.
        socket.emit("liveListRequest");
      } else {
        this.changeView({ viewName: "GoogleAuth" });
      }
    });

    socket.on("readSecret", async res => {
      if (res) {
        socket.emit("authCheck");
      } else {
        this.changeView({ viewName: "Secret" });
      }
    });

    // Recieve live list from Electron.
    socket.on("liveListResponse", async JSON => {
      const lives = JSON;
      if (lives.length < 1) {
        this.changeView({ viewName: "LiveNotFound" });
      } else {
        await this.setLives(lives);
        this.changeView({ viewName: "LiveList" });
      }

      // Conf requests for Electron.
      socket.emit("getQueueRequest");
      socket.emit("getTimerIntervalRequest");
      socket.emit("getNumberOfPlayingRequest");
      socket.emit("getNumberOfStandbyRequest");
      socket.emit("getReserveKeywordRequest");
      // Recieve conf from Electron.
      socket.on("getQueueResponse", async data => {
        await this.setQueue(data);
      });
      socket.on("getTimerIntervalResponse", async data => {
        await this.setTimerInterval(data);
      });
      socket.on("getNumberOfPlayingResponse", async data => {
        await this.setNumberOfPlaying(data);
      });
      socket.on("getNumberOfStandbyResponse", async data => {
        await this.setNumberOfStandby(data);
      });
      socket.on("getReserveKeywordResponse", async data => {
        await this.setReserveKeyword(data);
      });
    });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loading {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.atom-spinner,
.atom-spinner * {
  box-sizing: border-box;
}

.atom-spinner {
  height: 60px;
  width: 60px;
  overflow: hidden;
}

.atom-spinner .spinner-inner {
  position: relative;
  display: block;
  height: 100%;
  width: 100%;
}

.atom-spinner .spinner-circle {
  display: block;
  position: absolute;
  color: #ff1d5e;
  font-size: calc(60px * 0.24);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.atom-spinner .spinner-line {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation-duration: 1s;
  border-left-width: calc(60px / 25);
  border-top-width: calc(60px / 25);
  border-left-color: #ff1d5e;
  border-left-style: solid;
  border-top-style: solid;
  border-top-color: transparent;
}

.atom-spinner .spinner-line:nth-child(1) {
  animation: atom-spinner-animation-1 1s linear infinite;
  transform: rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
}

.atom-spinner .spinner-line:nth-child(2) {
  animation: atom-spinner-animation-2 1s linear infinite;
  transform: rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
}

.atom-spinner .spinner-line:nth-child(3) {
  animation: atom-spinner-animation-3 1s linear infinite;
  transform: rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
}

@keyframes atom-spinner-animation-1 {
  100% {
    transform: rotateZ(120deg) rotateX(66deg) rotateZ(360deg);
  }
}

@keyframes atom-spinner-animation-2 {
  100% {
    transform: rotateZ(240deg) rotateX(66deg) rotateZ(360deg);
  }
}

@keyframes atom-spinner-animation-3 {
  100% {
    transform: rotateZ(360deg) rotateX(66deg) rotateZ(360deg);
  }
}
</style>
