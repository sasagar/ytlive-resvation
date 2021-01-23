<template>
  <li :class="classObj">
    <div class="player">
      <FontAwesomeIcon
        @click="pageUser(player, index)"
        :icon="faVolumeUp"
        class="user-page"
      />
      <span class="index">{{ index + 1 }}</span>
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
      </span>
      <span class="requeue">
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
import Messages from "../mixins/Messages";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faUserSlash,
  faAngleDoubleDown,
  faVolumeUp
} from "@fortawesome/free-solid-svg-icons";

export default {
  name: "Player",
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      faUserSlash,
      faAngleDoubleDown,
      faVolumeUp
    };
  },
  props: {
    player: Object,
    index: Number
  },
  computed: {
    ...mapState(["status", "numberOfPlaying", "numberOfStandby"]),
    classObj() {
      if (this.player.playing) {
        return "playing";
      } else {
        if (this.index + 1 > this.numberOfPlaying + this.numberOfStandby) {
          return "";
        } else {
          return "standby";
        }
      }
    }
  },
  mixins: [Messages],
  methods: {
    ...mapActions(["setQueue"]),
    async delUser(player) {
      const tempQueue = this.status.queue.slice();
      const newQueue = tempQueue.filter(
        user => user.channelId != player.channelId
      );
      await this.setQueue(newQueue);
      this.sendChat(player.displayName + "さんの予約、取り消しましたー！");
    },
    async requeueUser(player) {
      const tempQueue = this.status.queue.slice();
      let newQueue = tempQueue.filter(
        user => user.channelId != player.channelId
      );
      player["playing"] = false;
      newQueue.push(player);
      await this.setQueue(newQueue);
      this.sendChat(player.displayName + "さん、並び直しましたー！");
    },
    async pageUser(player, index) {
      const tempQueue = this.status.queue.slice();
      tempQueue[index]["playing"] = true;
      await this.setQueue(tempQueue);
      this.sendChat(
        "大変お待たせしました。" + player.displayName + "さん、どうぞー！"
      );
    }
  }
};
</script>

<style lang="scss">
li {
  border-top: solid 1px #bbbbbb;
  border-bottom: solid 1px #bbbbbb;
  padding: 5px 10px;
  transition: all 0.3s ease;

  &.playing {
    background-color: rgba(201, 255, 208, 1);
  }

  &.standby {
    background-color: rgba(255, 201, 216, 1);
  }
  .player {
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    img {
      width: 18px;
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