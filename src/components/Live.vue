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
};
</script>

<style scoped>
</style>