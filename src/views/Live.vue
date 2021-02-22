<template>
  <tr
    class="live"
    @click="setCurrent(live.id, live.snippet.liveChatId, live.snippet.title)"
  >
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
      return this.date.format("HH:mm");
    }
  },
  methods: {
    ...mapActions([
      "changeView",
      "setCurrentLive",
      "setCurrentChat",
      "setCurrentTitle"
    ]),
    async setCurrent(liveId, liveChatId, liveTitle) {
      console.log("components/Live/setCurrent: Live = " + liveId);
      console.log("components/Live/setCurrent: Chat = " + liveChatId);
      console.log("components/Live/setCurrent: Title = " + liveTitle);
      await this.setCurrentLive(liveId);
      await this.setCurrentChat(liveChatId);
      await this.setCurrentTitle(liveTitle);
      this.changeView({ viewName: "LiveDashboard", id: liveChatId });
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
  transition: background-color 0.3s ease;

  &:hover {
    background-color: lighten(#ff1d5e, 40%);
  }

  &:active {
    background-color: lighten(#ff1d5e, 35%);
  }

  td {
    border: none;
    padding: 10px;
  }
}
</style>