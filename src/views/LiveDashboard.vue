<template>
  <div>
    <FontAwesomeIcon @click="openModal" :icon="faCog" class="cog" />
    <h1>LiveDashboard</h1>

    <!-- コンポーネント MyModal -->
    <SettingModal @close="closeModal" v-if="modal" />

    <button @click="getChat">手動チャット取得</button>
    <button v-if="timerRunning" @click="stopTimer">タイマーストップ</button>
    <button v-else @click="startTimer">タイマースタート</button>

    <div class="container">
      <div class="queue-container">
        <div class="queue-control">
          <span>
            <FontAwesomeIcon :icon="faUsersSlash" class="users-slash" />
          </span>
          <span>
            <FontAwesomeIcon :icon="faAngleDoubleDown" class="requeues" />1
          </span>
          <span>
            <FontAwesomeIcon :icon="faAngleDoubleDown" class="requeues" />2
          </span>
          <span>
            <FontAwesomeIcon :icon="faAngleDoubleDown" class="requeues" />3
          </span>
          <span>
            <FontAwesomeIcon :icon="faAngleDoubleDown" class="requeues" />4
          </span>
          <span>
            <FontAwesomeIcon :icon="faAngleDoubleDown" class="requeues" />5
          </span>
        </div>
        <ul class="queuelist">
          <template v-for="player in queue" :key="player.channelId">
            <Player :player="player" />
          </template>
        </ul>
      </div>
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

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faCog,
  faUsersSlash,
  faAngleDoubleDown
} from "@fortawesome/free-solid-svg-icons";

import Chat from "./Chat";
import Player from "./Player";
import SettingModal from "./SettingModal";

import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "LiveDashboard",
  components: {
    Chat,
    SettingModal,
    FontAwesomeIcon,
    Player
  },
  data() {
    return {
      modal: false,
      faCog,
      faUsersSlash,
      faAngleDoubleDown
    };
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
    ...mapState([
      "status",
      "timerInterval",
      "numberOfPlaying",
      "numberOfStandby",
      "reserveKeyword"
    ]),
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
    },
    timer() {
      return this.timerInterval;
    },
    playing() {
      return this.numberOfPlaying;
    },
    standby() {
      return this.numberOfStandby;
    },
    regex() {
      return this.reserveKeyword;
    },
    queue() {
      return this.status.queue;
    }
  },
  methods: {
    ...mapActions(["setNextPageToken", "setChatData", "setQueue"]),
    getChat() {
      socket.emit("getChatRequest", this.token);
    },
    getChatTimer() {
      console.log("views/LiveDashboard/Timer");
      socket.emit("getChatRequest", this.token);
    },
    startTimer() {
      this.$timer.start("getChatTimer");
    },
    stopTimer() {
      this.$timer.stop("getChatTimer");
    },
    openModal() {
      this.modal = true;
    },
    closeModal() {
      socket.emit("saveTimerInterval", this.timer);
      socket.emit("saveNumberOfPlaying", this.playing);
      socket.emit("saveNumberOfStandby", this.standby);
      socket.emit("saveReserveKeyword", this.regex);
      this.modal = false;
    }
  },
  mounted() {
    this.stopTimer();
    socket.on("getChatResponse", async obj => {
      await this.setNextPageToken(obj.nextPageToken);
      await this.setChatData(obj.items);

      if (this.regex) {
        const reg = this.regex;
        for (const item of obj.items) {
          const regexp = new RegExp(reg, "g");
          const msg = item.snippet.textMessageDetails.messageText;
          const id = item.authorDetails.channelId;
          if (regexp.test(msg)) {
            const tempQueue = await this.queue.slice();
            const match = tempQueue.find(queued => {
              queued.channelId === id;
              return queued;
            });
            if (typeof match === "undefined" || match.length === 0) {
              tempQueue.push(item.authorDetails);
              await this.setQueue(tempQueue);
              // Send reserve chat.
              socket.emit(
                "sendReserveMessage",
                item.authorDetails.displayName +
                  "さんの予約、受け付けましたー！"
              );
            }
          }
        }
      }
    });
  }
};
</script>

<style lang="scss">
.container {
  display: flex;
  justify-content: space-between;
  max-width: 960px;
  margin: 0 auto;
}

.queue-container {
  flex: 1;
}

.queue-control {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  width: 100%;

  span {
    background-color: rgba(46, 487, 242, 0.5);
    border-radius: 20px;
    display: block;
    padding: 5px;
  }
}

.queuelist,
.chatlist {
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 1;
}
.cog {
  color: rgba(120, 120, 120, 1);
  position: fixed;
  top: 10px;
  right: 10px;
}
</style>