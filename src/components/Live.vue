<template>
  <div>
    {{ live.id }}
    {{ live.snippet.title }}
  </div>
</template>

<script>
export default {
  name: "Live",
  props: {
    live: Object,
  },
  methods: {},
};
</script>

<style scoped>
</style>