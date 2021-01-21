<template>
  <div>
    <h1>LiveDashboard</h1>
    {{ this.$route.params["id"] }}

    <button @click="getChat">getChat!</button>
    <button v-if="timerRunning" @click="stopTimer">STOP</button>
    <button v-else @click="startTimer">START</button>

    <div class="container">
      <ul class="chatlist">
        <template v-for="chat in chatData" :key="chat.id">
          <Chat :chat="chat" />
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { mixin as VueTimers } from "vue-timers";

import Chat from "./Chat";

import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "LiveDashboard",
  components: {
    Chat
  },
  mixins: [VueTimers],
  emits: [
    "timer-tick:getChatTimer",
    "timer-start:getChatTimer",
    "timer-stop:getChatTimer"
  ],
  timers: {
    getChatTimer: {
      time: 8000,
      autostart: false,
      repeat: true,
      immediate: true
    }
  },
  computed: {
    ...mapState(["status"]),
    liveChatId() {
      return this.status.currentChatId;
    },
    chatData() {
      return this.status.chatData.slice().reverse();
    },
    token() {
      return this.status.nextPageToken;
    },
    timerRunning() {
      return this.timers.getChatTimer.isRunning;
    }
  },
  methods: {
    ...mapActions(["setNextPageToken", "setChatData"]),
    getChat() {
      socket.emit("getChatRequest", this.token);
    },
    getChatTimer() {
      console.log("test");
      socket.emit("getChatRequest", this.token);
    },
    startTimer() {
      this.$timer.start("getChatTimer");
    },
    stopTimer() {
      this.$timer.stop("getChatTimer");
    }
  },
  mounted() {
    this.startTimer();
    socket.on("getChatResponse", async obj => {
      await this.setNextPageToken(obj.nextPageToken);
      await this.setChatData(obj.items);
    });
  }
};
</script>

<style>
.chatlist {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>