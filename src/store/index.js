import router from "/src/router";
import { createStore } from "vuex";

export default createStore({
  state: {
    currentView: "Loading",
    status: {
      msg: "Waiting for Live data.",
      lives: {},
      currentLiveId: "",
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
  },
  modules: {},
});
