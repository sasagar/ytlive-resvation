<template>
  <li>
    <div class="chatupper">
      <span class="reserve" v-if="!reserved" @click="addPlayer(chat)">
        <FontAwesomeIcon :icon="faUserPlus" />
      </span>
      <img :src="chat.authorDetails.profileImageUrl" />
      <span class="name">
        {{ chat.authorDetails.displayName }}
      </span>
      <span class="time"> {{ formatDate }} {{ formatTime }}</span>
    </div>
    <div class="chatlower">
      {{ chat.snippet.displayMessage }}
    </div>
  </li>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Messages from "../mixins/Messages";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

export default {
  name: "Chat",
  components: {
    FontAwesomeIcon
  },
  props: {
    chat: Object
  },
  data() {
    return {
      faUserPlus
    };
  },
  mixins: [Messages],
  computed: {
    ...mapState(["status"]),
    date() {
      return moment(this.chat.snippet.publishedAt);
    },
    formatDate() {
      return this.date.format("YYYY/MM/DD");
    },
    formatTime() {
      return this.date.format("HH:mm:ss");
    },
    reserved() {
      if (this.status.queue.length === 0) {
        return false;
      } else {
        const res = this.status.queue.some(
          player => player.channelId === this.chat.authorDetails.channelId
        );
        return res;
      }
    },
    queue: {
      get() {
        return this.status.queue;
      },
      set(val) {
        this.setQueueSort(val);
      }
    }
  },
  methods: {
    ...mapActions(["setQueue"]),
    async addPlayer(item) {
      console.log("views/Chat/addPlayer");
      const tempQueue = this.queue;

      const user = item.authorDetails;
      user["playing"] = false;
      tempQueue.push(user);
      await this.setQueue(tempQueue);
      // Send reserve chat.
      this.sendChat(
        item.authorDetails.displayName + "さんの予約、受け付けましたー！"
      );
    }
  }
};
</script>

<style lang="scss" scoped>
li {
  border-top: solid 1px #bbbbbb;
  border-bottom: solid 1px #bbbbbb;
  padding: 10px 20px;
  .chatupper {
    font-size: 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .reserve {
      margin-right: 10px;
      cursor: pointer;
      color: #bbbbbb;
      transition: color 0.3s ease;

      &:hover {
        color: #00a7bd;
      }
    }
    img {
      width: 15px;
      height: auto;
      margin-right: 10px;
    }
    .name {
      font-weight: 600;
    }
    .time {
      margin-left: 10px;
      opacity: 0.8;
    }
  }
  .chatlower {
    font-size: 14px;
    text-align: left;
    padding-left: 25px;
  }
  & + li {
    border-top: none;
  }
}
</style>