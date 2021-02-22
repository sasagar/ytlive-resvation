<template>
  <li :class="classObj" :key="player.channelId">
    <div class="player">
      <i
        :class="this.fixed ? 'fa fa-anchor' : 'glyphicon glyphicon-pushpin'"
        @click="this.fixed = !this.fixed"
        aria-hidden="true"
      ></i>
      <span class="user-handle" title="並び替え">
        <FontAwesomeIcon :icon="faAlignJustify" />
      </span>
      <span class="user-page" @click="pageUser(player, index)" title="単独呼出">
        <FontAwesomeIcon :icon="faVolumeUp" />
      </span>
      <span
        class="user-mute"
        @click="muteUser(index)"
        :class="paged(index)"
        title="呼出解除"
      >
        <FontAwesomeIcon :icon="faVolumeMute" />
      </span>
      <span class="index">{{ index + 1 }}</span>
      <img :src="player.profileImageUrl" />
      <span class="name">
        {{ player.displayName }}
      </span>
      <span
        class="user-del-silent"
        @click="delUserSilent(player)"
        title="予約取消（アナウンス無し）"
      >
        <FontAwesomeIcon :icon="faUserSlash" />
      </span>
      <span class="user-del" @click="delUser(player)" title="予約取消">
        <FontAwesomeIcon :icon="faUserMinus" />
      </span>
    </div>
  </li>
</template>

<script>
import { mapActions, mapState } from "vuex";
import Messages from "../mixins/Messages";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faUserMinus,
  faUserSlash,
  faVolumeUp,
  faVolumeMute,
  faAlignJustify
} from "@fortawesome/free-solid-svg-icons";

export default {
  name: "Player",
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      faUserMinus,
      faUserSlash,
      faVolumeUp,
      faVolumeMute,
      faAlignJustify,
      fixed: false
    };
  },
  props: {
    player: Object,
    index: Number
  },
  computed: {
    ...mapState(["status", "numberOfPlaying", "numberOfStandby"]),
    classObj() {
      if (this.player.playing || typeof this.player.playing === "undefined") {
        return "playing";
      } else {
        if (this.index + 1 > this.numberOfPlaying + this.numberOfStandby) {
          return "";
        } else {
          return "standby";
        }
      }
    },
    queue: {
      get() {
        return this.status.queue;
      },
      set(val) {
        this.setQueue(val);
      }
    },
    playing: {
      get() {
        return this.player.playing;
      },
      set(obj) {
        this.queue[obj.index].playing = obj.playing;
      }
    }
  },
  mixins: [Messages],
  methods: {
    ...mapActions(["setQueue"]),
    paged(index) {
      console.log("views/Player/paged");
      if (typeof this.player.playing === "undefined") {
        this.playing = { index: index, playing: false };
      }
      if (this.player.playing) {
        return { mutable: false };
      } else {
        return { mutable: true };
      }
    },
    async delUser(player) {
      const tempQueue = this.status.queue.slice();
      const newQueue = tempQueue.filter(
        user => user.channelId != player.channelId
      );
      await this.setQueue(newQueue);
      this.sendChat(player.displayName + "さんの予約、取り消しましたー！");
    },
    async delUserSilent(player) {
      const tempQueue = this.status.queue.slice();
      const newQueue = tempQueue.filter(
        user => user.channelId != player.channelId
      );
      await this.setQueue(newQueue);
    },
    async requeueUser(player) {
      const tempQueue = this.status.queue.slice();
      let newQueue = tempQueue.filter(
        user => user.channelId != player.channelId
      );
      player["playing"] = false;
      newQueue.push(player);
      await this.setQueue(newQueue);
    },
    async muteUser(index) {
      const tempQueue = this.status.queue.slice();
      tempQueue[index].playing = false;
      await this.setQueue(tempQueue);
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
  transition: background-color 0.3s ease;

  &.playing {
    background-color: rgba(201, 255, 208, 1);
  }

  &.standby {
    background-color: rgba(255, 201, 216, 1);
  }
  .ghost {
    opacity: 0.5;
    background: #c8ebfb;
  }
  .player {
    font-size: 14px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .user-handle {
      cursor: move;
      padding: 5px;
      margin-right: 5px;
    }

    .user-page,
    .user-mute,
    .user-del-silent {
      cursor: pointer;
      margin-right: 5px;
    }

    .user-handle,
    .user-page,
    .user-mute,
    .user-del-silent,
    .user-del {
      padding: 5px;
      transition: opacity 0.3s ease;
      &:hover {
        opacity: 0.75;
      }
    }

    .mutable {
      opacity: 0.25;
      transition: none;
      cursor: not-allowed;
      &:hover {
        opacity: 0.25;
      }
    }

    .index {
      margin-right: 5px;
    }

    img {
      width: 18px;
      height: auto;
      margin-right: 5px;
    }
    .name {
      font-weight: 600;
      flex: 1;
      text-align: left;
    }
    .user-del {
      color: #f2636f;
      margin-right: 10px;
      cursor: pointer;
    }
    .user-requeue {
      color: #f2aa6b;
      margin-right: 15px;
      cursor: pointer;
    }
  }
  & + li {
    border-top: none;
  }
}
</style>