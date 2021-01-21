<template>
  <router-view v-slot="{ Component }">
    <transition name="main" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
import { mapActions, mapState } from "vuex";
import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "App",
  methods: {
    ...mapActions(["changeView", "setLives"])
  },
  computed: { ...mapState(["currentView", "status"]) },
  async mounted() {
    console.log("App/mounted");
    // Live list request for Electron.
    socket.emit("liveListRequest");
    // Recieve live list from Electron.
    socket.on("liveListResponse", async JSON => {
      const lives = JSON;
      if (lives.length < 1) {
        this.changeView({ viewName: "LiveNotFound" });
      } else {
        await this.setLives(lives);
        this.changeView({ viewName: "LiveList" });
      }
    });
  }
};
</script>

<style>
body {
  background-color: #ffffff;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
}

.main-enter-from {
  transform: translate(100px, 0);
  opacity: 0;
}
.main-enter-to {
  opacity: 1;
}
.main-enter-active {
  transition: all 0.5s 0s ease;
}
.main-leave-from {
  transform: translate(0, 0);
  opacity: 1;
}
.main-leave-to {
  transform: translate(-100px, 0);
  opacity: 0;
}
.main-leave-active {
  transition: all 0.5s 0s ease;
}
</style>
