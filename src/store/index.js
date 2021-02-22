import router from "/src/router";
import { createStore } from "vuex";

import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default createStore({
  state: {
    currentView: "Loading",
    timerInterval: 5000,
    numberOfPlaying: 3,
    numberOfStandby: 2,
    reserveKeyword: "",
    cancelKeyword: "",
    status: {
      msg: "Waiting for Live data.",
      lives: {},
      currentLiveId: "",
      currentChatId: "",
      currentTitle: "",
      nextPageToken: "",
      chatData: [],
      queue: [],
    },
  },
  mutations: {
    changeView(state, view) {
      console.log("store/mutations/changeView");
      const viewName = view.viewName;
      state.currentView = viewName;
    },
    setLives(state, payload) {
      console.log("store/mutations/setLives");
      state.status.lives = payload;
    },
    setCurrentLive(state, payload) {
      console.log("store/mutations/setCurrentLive");
      state.status.currentLiveId = payload;
    },
    setCurrentChat(state, payload) {
      console.log("store/mutations/setCurrentChat");
      state.status.currentChatId = payload;
    },
    setCurrentTitle(state, payload) {
      console.log("store/mutations/setCurrentTitle");
      state.status.currentTitle = payload;
    },
    setNextPageToken(state, payload) {
      console.log("store/mutations/setNextPageToken");
      state.status.nextPageToken = payload;
    },
    setChatData(state, payload) {
      console.log("store/mutations/setChatData");
      state.status.chatData = state.status.chatData.concat(payload);
    },
    setQueue(state, payload) {
      console.log("store/mutations/setQueue");
      state.status.queue = payload;
    },
    setTimerInterval(state, payload) {
      console.log("store/mutations/setTimerInterval");
      state.timerInterval = payload;
    },
    setNumberOfPlaying(state, payload) {
      console.log("store/mutations/setNumberOfPlaying");
      state.numberOfPlaying = payload;
    },
    setNumberOfStandby(state, payload) {
      console.log("store/mutations/setNumberOfStandby");
      state.numberOfStandby = payload;
    },
    setReserveKeyword(state, payload) {
      console.log("store/mutations/setReserveKeyword");
      state.reserveKeyword = payload;
    },
    setCancelKeyword(state, payload) {
      console.log("store/mutations/setCancelKeyword");
      state.cancelKeyword = payload;
    },
  },
  actions: {
    changeView(context, payload) {
      console.log("store/actions/changeView");
      context.commit("changeView", payload);
      const viewName = payload.viewName;
      const id = payload.id;
      if (id != null) {
        router.push({ name: viewName, params: { id } });
      } else {
        router.push({ name: viewName });
      }
    },
    setLives(context, payload) {
      console.log("store/actions/setLives");
      context.commit("setLives", payload);
    },
    setCurrentLive(context, payload) {
      console.log("store/actions/setCurrentLive");
      context.commit("setCurrentLive", payload);
    },
    setCurrentTitle(context, payload) {
      console.log("store/actions/setCurrentTitle");
      context.commit("setCurrentTitle", payload);
    },
    setCurrentChat(context, payload) {
      console.log("store/actions/setCurrentChat");
      socket.emit("setChatId", payload);
      context.commit("setCurrentChat", payload);
    },
    setNextPageToken(context, payload) {
      console.log("store/actions/setNextPageToken");
      context.commit("setNextPageToken", payload);
    },
    setChatData(context, payload) {
      console.log("store/actions/setChatData");
      context.commit("setChatData", payload);
    },
    setQueue(context, payload) {
      console.log("store/actions/setQueue");
      context.commit("setQueue", payload);
      socket.emit("saveQueue", payload);
    },
    setQueueSort(context, payload) {
      console.log("store/actions/setQueueSort");
      let res = [];
      payload.forEach((player, index) => {
        if (index >= this.playing) {
          player.playing = false;
        }
        res.push(player);
      });
      context.commit("setQueue", res);
      socket.emit("saveQueue", res);
    },
    setTimerInterval(context, payload) {
      console.log("store/actions/setTimerInterval");
      let timer = 5000;
      if (payload > 5000) {
        timer = payload;
      }
      context.commit("setTimerInterval", timer);
      socket.emit("saveTimerInterval", timer);
    },
    setNumberOfPlaying(context, payload) {
      console.log("store/actions/setNumberOfPlaying");
      let count = 1;
      if (payload > 1) {
        count = payload;
      }
      context.commit("setNumberOfPlaying", count);
      socket.emit("saveNumberOfPlaying", count);
    },
    setNumberOfStandby(context, payload) {
      console.log("store/actions/setNumberOfStandby");
      let count = 0;
      if (payload > 0) {
        count = payload;
      }
      context.commit("setNumberOfStandby", count);
      socket.emit("saveNumberOfStandby", count);
    },
    setReserveKeyword(context, payload) {
      console.log("store/actions/setReserveKeyword");
      context.commit("setReserveKeyword", payload);
      socket.emit("saveReserveKeyword", payload);
    },
    setCancelKeyword(context, payload) {
      console.log("store/actions/setCancelKeyword");
      context.commit("setCancelKeyword", payload);
      socket.emit("saveCancelKeyword", payload);
    },
  },
  getters: {
    getMatchQueue: (state) => (id) => {
      return state.status.queue.filter((queued) => queued.channelId === id);
    },
    getMatchQueueIndex: (state) => (id) => {
      const res = state.status.queue.findIndex(
        (queued) => queued.channelId === id
      );
      return res;
    },
  },
  modules: {},
});
