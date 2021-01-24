<template>
  <div>
    <h2>GoogleAuth</h2>
    <div>
      <input type="text" v-model="code" />
      <button @click="authrequest">認証</button>
    </div>
    <div>
      ブラウザで認証画面が開きますので、利用したいYouTubeチャンネルでログインして、アプリの認証を行って下さい。<br />
      最後には認証コードが表示されるので、コピーしてここに貼り付けた後「認証」を押して認証して下さい。
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "GoogleAuth",
  data() {
    return { code: "" };
  },
  computed: {
    ...mapState(["status"])
  },
  methods: {
    ...mapActions(["changeView"]),
    authrequest() {
      socket.emit("setCode", this.code);
    }
  },
  mounted() {
    socket.on("setCodeResult", res => {
      if (res) {
        this.changeView({ viewName: "Loading" });
      }
    });
  }
};
</script>

<style lang="scss" scoped>
table {
  border: none;
  border-collapse: collapse;
  margin-left: auto;
  margin-right: auto;
  max-width: 960px;
}
</style>