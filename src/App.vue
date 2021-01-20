<template>
  <component :is="currentView" :status="status" @liveSelect="liveSelect" />
</template>

<script>
import Loading from "./components/Loading.vue";
import LiveList from "./components/LiveList.vue";

import { ipcRenderer } from "electron";

export default {
  name: "App",
  components: {
    Loading,
  },
  methods: {
    loading() {
      this.currentView = "Loading";
    },
    setLives: function (arg) {
      let obj = {
        msg: this.status.msg,
        lives: arg,
        currentLiveId: this.status.currentLiveId,
      };
      this.status = obj;
    },
    liveSelect(liveId) {
      console.log(liveId);
    },
  },
  mounted() {
    ipcRenderer.on("test", (event, arg) => {
      this.setLives(JSON.parse(arg));
      this.currentView = LiveList;
    });
  },
  data() {
    return {
      currentView: "Loading",
      status: {
        msg: "Waiting for Live data.",
        lives: {},
        currentLiveId: "",
      },
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
