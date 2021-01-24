<template>
  <ul>
    <template v-for="(player, index) in queue" :key="player.channelId">
      <li :class="classObj(player.playing)">
        <span class="number">{{ index + 1 }}</span>
        <img :src="player.profileImageUrl" />
        <span class="name">
          {{ player.displayName }}
        </span>
      </li>
    </template>
  </ul>
</template>

<script>
import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "Display",
  data() {
    return {
      queue: {},
      numberOfPlaying: 3,
      numberOfStandby: 2
    };
  },
  methods: {
    classObj: function(flag) {
      return {
        playing: flag === true,
        standby: flag === false || typeof flag === "undefined"
      };
    }
  },
  computed: {
    limitQueue() {
      return this.queue.slice(0);
    }
  },
  mounted() {
    socket.emit("firstDisplayRequest");
    socket.on("firstDisplayResponse", data => {
      this.queue = data.queue;
      this.numberOfPlaying = data.numberOfPlaying;
      this.numberOfStandby = data.numberOfStandby;
    });
    socket.on("getQueueResponseOnce", data => {
      this.queue = data;
    });
    socket.on("getNumberOfPlayingRequest", data => {
      this.queue = data;
    });
    socket.on("getNumberOfStandbyResponse", data => {
      this.queue = data;
    });
  }
};
</script>

<style lang="scss" scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;

  li {
    font-size: 24px;
    border-radius: 10px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    max-width: 250px;
    padding: 5px;
    transition: all 0.3s ease;
    margin-bottom: 10px;

    &.playing {
      background-color: #ffa169;
      color: darken(#00d600, 20%);
      animation: flash 1s linear;
    }
    &.standby {
      background-color: lighten(#ff2089, 30%);
      color: darken(#00d600, 20%);
    }

    .number {
      &::after {
        content: ":";
        display: inline;
      }
      margin-right: 10px;
    }
    img {
      width: 24px;
      margin-right: 10px;
    }
    .name {
      text-align: left;
    }
  }
}

@keyframes flash {
  0%,
  50%,
  100% {
    background-color: #ffa169;
  }
  25%,
  75% {
    background-color: rgba(255, 252, 149, 1);
  }
}
</style>