<template>
  <router-view v-slot="{ Component }">
    <transition name="main" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
export default {
  name: "App"
};
</script>

<style>
html {
  height: 100%;
}
body {
  background-color: #ffffff;
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
  height: 100%;
}

h1 {
  color: #ff1d5e;
  border-bottom: solid 3px #ff1d5e;
  margin-bottom: 20px;
}

.main-enter-from {
  transform: translate(100px, 0);
  opacity: 0;
}

.main-enter-to {
  opacity: 1;
}

.main-enter-active {
  transition: all 0.5s 0s ease;
}

.main-leave-from {
  transform: translate(0, 0);
  opacity: 1;
}

.main-leave-to {
  transform: translate(-100px, 0);
  opacity: 0;
}

.main-leave-active {
  transition: all 0.5s 0s ease;
}
</style>
