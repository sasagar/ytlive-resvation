<template>
  <div>
    <h1>Load File</h1>
    <p>
      client_secretがないようです。<br />取得したファイルを下のボタンで開いて保存して下さい。
    </p>
    <button @click="open">client_secret.jsonを選択</button>
    <div class="errorMessage" :class="{ canceled: canceled, error: error }">
      <h3>Error</h3>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  name: "Secret",
  data() {
    return {
      canceled: false,
      error: false,
      message: ""
    };
  },
  methods: {
    ...mapActions(["changeView"]),
    open() {
      socket.emit("openSecretSelect");
    }
  },
  mounted() {
    socket.on("completeSecretSave", () => {
      this.changeView({ viewName: "Loading" });
    });

    socket.on("cancelFileRead", () => {
      this.canceled = true;
      this.error = false;
      this.message = "ファイル選択がキャンセルされました。";
    });

    socket.on("errorSecret", err => {
      this.canceled = true;
      this.error = true;
      this.message = "エラーが発生しました。" + JSON.stringify(err);
    });
  }
};
</script>

<style lang="scss" scoped>
button {
  background-color: #ffffff;
  display: block;
  padding: 5px;
  border: solid 2px #2c3e50;
  transition: background-color 0.3s ease, color 0.3s ease;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #2c3e50;
    color: #ffffff;
  }
}

.errorMessage {
  display: none;

  &.canceled {
    display: block;
    &.error {
      h3 {
        color: #ff1d5e;
      }
    }
  }
}
</style>