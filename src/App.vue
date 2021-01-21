<template>
  <component :is="this.currentView" />
</template>

<script>
import { mapActions, mapState } from "vuex";

import Loading from "./components/Loading.vue";
import LiveNotFound from "./components/LiveNotFound.vue";
import LiveList from "./components/LiveList.vue";
import LiveDashboard from "./components/LiveDashboard.vue";

import { ipcRenderer } from "electron";

export default {
  name: "App",
  components: {
    Loading,
    LiveNotFound,
    LiveList,
    LiveDashboard
  },
  methods: {
    ...mapActions(["changeView", "setLives"])
  },
  computed: { ...mapState(["currentView", "status"]) },
  async mounted() {
    console.log("App/mounted");
    const lives = await ipcRenderer.invoke("getLives");
    if (lives.length < 1) {
      this.changeView("LiveNotFound");
    } else {
      await this.setLives(lives);
      this.changeView("LiveList");
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
}
</style>
