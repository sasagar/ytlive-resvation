<template>
  <li>
    <div class="player">
      <img :src="player.profileImageUrl" />
      <span class="name">
        {{ player.displayName }}
      </span>
      <span class="remove">
        <FontAwesomeIcon
          @click="delUser(player)"
          :icon="faUserSlash"
          class="user-del"
        />
        <FontAwesomeIcon
          @click="requeueUser(player)"
          :icon="faAngleDoubleDown"
          class="user-requeue"
        />
      </span>
    </div>
  </li>
</template>

<script>
import { mapActions, mapState } from "vuex";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faUserSlash,
  faAngleDoubleDown
} from "@fortawesome/free-solid-svg-icons";

import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "Player",
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      faUserSlash,
      faAngleDoubleDown
    };
  },
  props: {
    player: Object
  },
  computed: {
    ...mapState(["status"])
  },
  methods: {
    ...mapActions(["setQueue"]),
    async delUser(player) {
      const tempQueue = this.status.queue.slice();
      const newQueue = tempQueue.filter(
        user => user.channelId != player.channelId
      );
      await this.setQueue(newQueue);
      socket.emit(
        "sendReserveMessage",
        player.displayName + "さんの予約、取り消しましたー！"
      );
    },
    async requeueUser(player) {
      const tempQueue = this.status.queue.slice();
      let newQueue = tempQueue.filter(
        user => user.channelId != player.channelId
      );
      newQueue.push(player);
      await this.setQueue(newQueue);
      socket.emit(
        "sendReserveMessage",
        player.displayName + "さん、並び直しましたー！"
      );
    }
  }
};
</script>

<style lang="scss">
li {
  border-top: solid 1px #bbbbbb;
  border-bottom: solid 1px #bbbbbb;
  padding: 10px 20px;
  .player {
    font-size: 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    img {
      width: 15px;
      height: auto;
      margin-right: 10px;
    }
    .name {
      font-weight: 600;
    }
    .user-del {
      color: #f2636f;
    }
    .user-requeue {
      color: #f2aa6b;
    }
  }
  & + li {
    border-top: none;
  }
}
</style>