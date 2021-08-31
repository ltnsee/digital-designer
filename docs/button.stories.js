import LtnsButton from "../packages/button";

export default {
  title: "Ltns Design/通用/Button 按钮",
  component: LtnsButton,
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { LtnsButton },
  template: '<ltns-button v-bind="$props">我是按钮</ltns-button>',
});

export const Type = Template.bind({});
Type.args = {
  type: "primary",
};
