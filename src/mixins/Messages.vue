<script>
import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default {
  methods: {
    sendChat(message) {
      socket.emit("sendReserveMessage", message);
    }
  }
};
</script>