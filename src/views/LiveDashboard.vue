<template>
  <div>
    <h1>LiveDashboard</h1>
    {{ this.$route.params["id"] }}

    <button @click="getChat">getChat!</button>
    <template v-for="chat in chatData" :key="chat.id">
      <Chat :chat="chat" />
    </template>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

import Chat from "./Chat";

const io = require("socket.io-client");
const socket = io("http://localhost:8081");

export default {
  name: "LiveDashboard",
  components: {
    Chat
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
    }
  },
  methods: {
    ...mapActions(["setNextPageToken", "setChatData"]),
    getChat() {
      socket.emit("getChatRequest", this.token);
    }
  },
  mounted() {
    socket.on("getChatResponse", async obj => {
      await this.setNextPageToken(obj.nextPageToken);
      await this.setChatData(obj.items);
    });
  }
};
</script>