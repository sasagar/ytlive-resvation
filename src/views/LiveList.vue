<template>
  <div>
    <h2>Live List</h2>
    <table>
      <thead>
        <tr>
          <th>Start</th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="live in lives" :key="live.id">
          <Live :live="live" />
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from "vuex";

import Live from "./Live";

export default {
  name: "LiveList",
  components: {
    Live: Live
  },
  computed: {
    ...mapState(["status"]),
    lives() {
      return this.status.lives;
    }
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