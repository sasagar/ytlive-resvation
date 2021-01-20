<template>
  <h2>Live List</h2>
  <div v-for="live in status.lives" :key="live.id">
    <Live :live="live" @click="liveSelect" />
  </div>
</template>

<script>
import Live from "./Live";

export default {
  name: "LiveList",
  components: {
    Live: Live,
  },
  props: {
    status: Object,
  },
  computed: {
    dataComputed: {
      get() {
        return this.data;
      },
      set(value) {
        this.$emit("update:data", value);
      },
    },
  },
  methods: {
    liveSelect() {
      this.$emit("liveSelect");
    },
  },
};
</script>

<style scoped>
</style>