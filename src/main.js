import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import packages from "../packages/index.js";
import "./styles/index.scss";

Vue.use(ElementUI, {
  size: "small",
  menuType: "text",
});

Vue.use(packages);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
