<template>
  <router-view v-slot="{ Component }">
    <transition name="main" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
import { mapActions, mapState } from "vuex";

import { ipcRenderer } from "electron";

export default {
  name: "App",
  methods: {
    ...mapActions(["changeView", "setLives"])
  },
  computed: { ...mapState(["currentView", "status"]) },
  async mounted() {
    console.log("App/mounted");
    const lives = await ipcRenderer.invoke("getLives");
    if (lives.length < 1) {
      this.changeView({ viewName: "LiveNotFound" });
    } else {
      await this.setLives(lives);
      this.changeView({ viewName: "LiveList" });
    }
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
