<template>
  {{ chat.authorDetails.displayName }}
  {{ chat.snippet.displayMessage }}
  <img :src="chat.authorDetails.profileImageUrl" />
</template>

<script>
export default {
  name: "Chat",
  props: {
    chat: Object
  }
};
</script>