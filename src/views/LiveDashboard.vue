<template>
  <div class="dashboard">
    <div class="back" @click="back">
      <FontAwesomeIcon :icon="faChevronLeft" /> Back
    </div>
    <FontAwesomeIcon @click="openModal" :icon="faCog" class="cog" />
    <h1>LiveDashboard</h1>
    <h2>{{ liveTitle }}</h2>

    <!-- コンポーネント MyModal -->
    <SettingModal @close="closeModal" v-if="modal" />

    <span class="button" @click="getChat" title="手動チャット更新">
      <FontAwesomeIcon :icon="faCommentAlt" />&nbsp;
      <FontAwesomeIcon :icon="faRedoAlt" />
    </span>
    <span
      class="button"
      v-if="timerRunning"
      @click="stopTimer"
      title="タイマーをポーズする（実行中）"
    >
      <FontAwesomeIcon :icon="faStopwatch" />&nbsp;
      <FontAwesomeIcon :icon="faPause" />&nbsp; (Running)
    </span>
    <span
      class="button"
      v-else
      @click="startTimer"
      title="タイマーをスタートする（停止中）"
    >
      <FontAwesomeIcon :icon="faStopwatch" />&nbsp;
      <FontAwesomeIcon :icon="faPlay" />&nbsp; (Stopped)
    </span>

    <div class="container">
      <div class="queue-container">
        <div class="queue-control">
          <span title="キューのクリア">
            <FontAwesomeIcon
              :icon="faUsersSlash"
              class="users-slash"
              @click="clearQueue"
            />
          </span>
          <span title="先頭1人呼び出し">
            <FontAwesomeIcon
              :icon="faUser"
              class="requeues"
              @click="pageAll(1)"
            />
          </span>
          <span title="先頭2人呼び出し">
            <FontAwesomeIcon
              :icon="faUserFriends"
              class="requeues"
              @click="pageAll(2)"
            />
          </span>
          <span title="先頭3人呼び出し">
            <FontAwesomeIcon
              :icon="faUsers"
              class="requeues"
              @click="pageAll(3)"
            />
          </span>
        </div>

        <draggable
          class="queuelist"
          tag="transition-group"
          :component-data="{
            tag: 'ul',
            type: 'transition-group',
            name: !drag ? 'flip-list' : null,
          }"
          v-model="queue"
          v-bind="dragOptions"
          @start="drag = true"
          @end="drag = false"
          item-key="channelId"
          handle=".user-handle"
        >
          <template #item="{ element, index }">
            <Player :player="element" :index="index" />
          </template>
        </draggable>
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
import { mapActions, mapState, mapGetters } from "vuex";
import { mixin as VueTimers } from "vue-timers";
import Messages from "../mixins/Messages";
import draggable from "vuedraggable";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faChevronLeft,
  faCog,
  faUsersSlash,
  faAngleDoubleDown,
  faUser,
  faUsers,
  faUserFriends,
  faPlay,
  faPause,
  faStopwatch,
  faCommentAlt,
  faRedoAlt
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
    Player,
    draggable
  },
  data() {
    return {
      modal: false,
      faChevronLeft,
      faCog,
      faUsersSlash,
      faAngleDoubleDown,
      faUser,
      faUsers,
      faUserFriends,
      faPlay,
      faPause,
      faStopwatch,
      faCommentAlt,
      faRedoAlt,
      drag: false
    };
  },
  mixins: [VueTimers, Messages],
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
    ...mapGetters(["getMatchQueue", "getMatchQueueIndex"]),
    ...mapState([
      "status",
      "timerInterval",
      "numberOfPlaying",
      "numberOfStandby",
      "reserveKeyword",
      "cancelKeyword"
    ]),
    timerIntvl: {
      get() {
        return this.timerInterval;
      },
      set(val) {
        let time = 5000;
        if (val >= 5000) {
          time = val;
        }
        this.setTimerInterval(time);
        this.timers.getChatTimer.time = time;
      }
    },
    liveId() {
      return this.status.currentLiveId;
    },
    liveChatId() {
      return this.status.currentChatId;
    },
    liveTitle() {
      return this.status.currentTitle;
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
    playing() {
      return this.numberOfPlaying;
    },
    standby() {
      return this.numberOfStandby;
    },
    regex() {
      return this.reserveKeyword;
    },
    cRegex() {
      return this.cancelKeyword;
    },
    queue: {
      get() {
        return this.status.queue;
      },
      set(val) {
        this.setQueueSort(val);
      }
    },
    queueCount() {
      return this.status.queue.length;
    },
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  methods: {
    ...mapActions([
      "changeView",
      "setNextPageToken",
      "setChatData",
      "setQueue",
      "setQueueSort",
      "setTimerInterval"
    ]),
    back() {
      this.changeView({ viewName: "LiveList" });
    },
    sort() {
      this.list = this.list.sort((a, b) => a.order - b.order);
    },
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
      this.modal = false;
    },
    clearQueue() {
      if (confirm("全てのキューをクリアして良いですか？")) {
        this.queue = [];
      }
    },
    async pageAll(num) {
      const tempQueue = await this.queue;
      let names = "";

      tempQueue.forEach((user, i) => {
        if (i < num) {
          names += user.displayName + "さん ";
          tempQueue[i]["playing"] = true;
        }
      });

      this.setQueue(tempQueue);
      this.sendChat("大変お待たせしました。" + names + "、どうぞー。");
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
          const regexp = new RegExp(reg, "ig");
          const msg = item.snippet.textMessageDetails.messageText;
          const id = item.authorDetails.channelId;
          if (regexp.test(msg)) {
            const tempQueue = this.queue;
            const match = this.getMatchQueue(id);
            if (match.length === 0) {
              const user = item.authorDetails;
              user["playing"] = false;
              tempQueue.push(user);
              await this.setQueue(tempQueue);
              // Send reserve chat.
              this.sendChat(
                item.authorDetails.displayName +
                  "さんの予約、受け付けましたー！"
              );
              // } else {
              //   this.sendChat(
              //     item.authorDetails.displayName + "さんの予約は受付済みです！"
              //   );
            }
          }
        }
      }
      if (this.cRegex) {
        const reg = this.cRegex;
        for (const item of obj.items) {
          const regexp = new RegExp(reg, "ig");
          const msg = item.snippet.textMessageDetails.messageText;
          const id = item.authorDetails.channelId;
          if (regexp.test(msg)) {
            const tempQueue = this.queue;
            const match = this.getMatchQueueIndex(id);
            if (match >= 0) {
              tempQueue.splice(match, 1);
              await this.setQueue(tempQueue);
              // Send reserve chat.
              this.sendChat(
                item.authorDetails.displayName +
                  "さんの予約、取り消しましたー！"
              );
            }
          }
        }
      }
    });
  },
  watch: {
    timerInterval: function(newVal, oldVal) {
      let time = 5000;
      if (newVal >= 5000) {
        time = newVal;
      } else {
        time = oldVal;
      }
      this.timerIntvl = time;
    }
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  height: 100%;
}

h2 {
  font-size: 1.1rem;
  margin-bottom: 20px;
  text-decoration: underline;
}

.button {
  background-color: #ffffff;
  display: inline-block;
  padding: 5px 10px;
  border: solid 2px #2c3e50;
  transition: background-color 0.3s ease, color 0.3s ease;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #2c3e50;
    color: #ffffff;
  }

  & + .button {
    margin-left: 20px;
  }
}

.container {
  display: flex;
  justify-content: space-between;
  max-width: 960px;
  margin: 20px auto;
}

.queue-container {
  flex: 1;
}

.queue-control {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20px;

  span {
    background-color: #ffffff;
    display: block;
    padding: 5px;
    width: 40px;
    border: solid 2px #2c3e50;
    transition: background-color 0.3s ease, color 0.3s ease;
    cursor: pointer;
    text-align: center;

    &:hover {
      background-color: #2c3e50;
      color: #ffffff;
    }
  }
}

.queuelist {
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
}

.chatlist {
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: scroll;
  margin-left: 30px;
  height: calc(100vh - 150px);
}

.back {
  color: rgba(120, 120, 120, 1);
  position: fixed;
  top: 5px;
  left: 10px;
  font-size: 25px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: rgba(92, 92, 92, 1);
  }
}

.cog {
  color: rgba(120, 120, 120, 1);
  position: fixed;
  top: 10px;
  right: 10px;
  font-size: 25px;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: rgba(92, 92, 92, 1);
  }
}
</style>