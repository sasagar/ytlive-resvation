<template>
  <tr class="live" @click="setCurrent(live.id)">
    <td>{{ formatDate }} {{ formatTime }}</td>
    <td>
      {{ live.snippet.title }}
    </td>
  </tr>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";

export default {
  name: "Live",
  props: {
    live: Object
  },
  computed: {
    ...mapState(["status"]),
    date() {
      return moment(this.live.snippet.scheduledStartTime);
    },
    formatDate() {
      return this.date.format("YYYY/MM/DD");
    },
    formatTime() {
      return this.date.format("HH:MM");
    }
  },
  methods: {
    ...mapActions(["changeView", "setCurrentLive"]),
    async setCurrent(liveId) {
      console.log("components/Live/setCurrent: " + liveId);
      await this.setCurrentLive(liveId);
      this.changeView({ viewName: "LiveDashboard", id: liveId });
    }
  }
};
</script>

<style lang="scss" scoped>
$background: #ffffff;
.live {
  background-color: $background;
  cursor: pointer;
  border-top: solid 1px #999999;
  border-bottom: solid 1px #999999;

  &:hover {
    background-color: darken($background, 10%);
  }

  td {
    border: none;
    padding: 10px;
  }
}
</style>