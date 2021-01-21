<template>
  <li>
    <div class="chatupper">
      <img :src="chat.authorDetails.profileImageUrl" />
      <span class="name">
        {{ chat.authorDetails.displayName }}
      </span>
      <span class="time"> {{ formatDate }} {{ formatTime }}</span>
    </div>
    <div class="chatlower">
      {{ chat.snippet.displayMessage }}
    </div>
  </li>
</template>

<script>
import { mapState } from "vuex";
import moment from "moment";

export default {
  name: "Chat",
  props: {
    chat: Object
  },
  computed: {
    ...mapState(["status"]),
    date() {
      return moment(this.chat.snippet.publishedAt);
    },
    formatDate() {
      return this.date.format("YYYY/MM/DD");
    },
    formatTime() {
      return this.date.format("HH:mm:ss");
    }
  }
};
</script>

<style lang="scss">
li {
  border-top: solid 1px #bbbbbb;
  border-bottom: solid 1px #bbbbbb;
  padding: 10px 20px;
  .chatupper {
    font-size: 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    img {
      width: 15px;
      height: auto;
      margin-right: 10px;
    }
    .name {
      font-weight: 600;
    }
    .time {
      margin-left: 10px;
      opacity: 0.8;
    }
  }
  .chatlower {
    font-size: 14px;
    text-align: left;
    padding-left: 25px;
  }
  & + li {
    border-top: none;
  }
}
</style>