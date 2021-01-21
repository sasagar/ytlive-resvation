import router from "/src/router";
import { createStore } from "vuex";

import * as io from "socket.io-client";
const socket = io("http://localhost:8081");

export default createStore({
  state: {
    currentView: "Loading",
    status: {
      msg: "Waiting for Live data.",
      lives: {},
      currentLiveId: "",
      currentChatId: "",
      nextPageToken: "",
      chatData: [],
    },
  },
  mutations: {
    changeView(state, view) {
      console.log("store/mutations/changeView");
      const viewName = view.viewName;
      const id = view.id;
      state.currentView = viewName;
      if (id) {
        router.push({ name: viewName, params: { id } });
      } else {
        router.push(viewName);
      }
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
    setNextPageToken(state, payload) {
      console.log("store/mutations/setNextPageToken");
      state.status.nextPageToken = payload;
    },
    setChatData(state, payload) {
      console.log("store/mutations/setChatData");
      state.status.chatData = state.status.chatData.concat(payload);
    },
  },
  actions: {
    changeView(context, payload) {
      console.log("store/actions/changeView");
      context.commit("changeView", payload);
    },
    setLives(context, payload) {
      console.log("store/actions/setLives");
      context.commit("setLives", payload);
    },
    setCurrentLive(context, payload) {
      console.log("store/actions/setCurrentLive");
      context.commit("setCurrentLive", payload);
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
  },
  modules: {},
});
