import SvgIcon from './svg-icon/index';
import ProcessConfig from './process-config/index';
import BasicSetting from './basic-setting/index';
import SelectUser from './select-user/index';
import Vue from 'vue';

const components = [SvgIcon, ProcessConfig, BasicSetting, SelectUser];

Vue.config.productionTip = false;

Vue.prototype.dispatch = function (componentName, eventName, params) {
  var parent = this.$parent || this.$root;
  var name = parent.$options.componentName;
  //寻找父级，如果父级不是符合的组件名，则循环向上查找
  while (parent && (!name || name !== componentName)) {
    parent = parent.$parent;

    if (parent) {
      name = parent.$options.componentName;
    }
  }
  //找到符合组件名称的父级后，触发其事件。整体流程类似jQuery的closest方法
  if (parent) {
    parent.$emit.apply(parent, [eventName].concat(params));
  }
};

const install = function (Vue) {
  components.forEach((component) => {
    Vue.use(component);
  });
};

// install(Vue)
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  SvgIcon,
  ProcessConfig,
  BasicSetting,
  SelectUser,
  install,
};
