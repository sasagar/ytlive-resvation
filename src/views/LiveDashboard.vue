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
            <FontAwesomeIcon
              :icon="faUsersSlash"
              class="users-slash"
              @click="clearQueue"
            />
          </span>
          <span>
            <FontAwesomeIcon
              :icon="faUser"
              class="requeues"
              @click="pageAll(1)"
            />
          </span>
          <span>
            <FontAwesomeIcon
              :icon="faUserFriends"
              class="requeues"
              @click="pageAll(2)"
            />
          </span>
          <span>
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

        <!-- <ul class="queuelist">
          <template v-for="(player, index) in queue" :key="player.channelId">
            <Player :player="player" :index="index" />
          </template>
        </ul> -->
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
  faCog,
  faUsersSlash,
  faAngleDoubleDown,
  faUser,
  faUsers,
  faUserFriends
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
      faCog,
      faUsersSlash,
      faAngleDoubleDown,
      faUser,
      faUsers,
      faUserFriends,
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
    ...mapGetters(["getMatchQueue"]),
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
    queue: {
      get() {
        return this.status.queue;
      },
      set(val) {
        this.setQueue(val);
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
    ...mapActions(["setNextPageToken", "setChatData", "setQueue"]),
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
      socket.emit("saveTimerInterval", this.timer);
      socket.emit("saveNumberOfPlaying", this.playing);
      socket.emit("saveNumberOfStandby", this.standby);
      socket.emit("saveReserveKeyword", this.regex);
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
          const regexp = new RegExp(reg, "g");
          const msg = item.snippet.textMessageDetails.messageText;
          const id = item.authorDetails.channelId;
          if (regexp.test(msg)) {
            const tempQueue = this.queue;
            const match = this.getMatchQueue(id);
            if (match.length === 0) {
              tempQueue.push(item.authorDetails);
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
  margin-bottom: 20px;

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

.chatlist {
  margin-left: 30px;
}

.cog {
  color: rgba(120, 120, 120, 1);
  position: fixed;
  top: 10px;
  right: 10px;
}
</style>