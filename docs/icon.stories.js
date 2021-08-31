import LtnsIcon from "../packages/icon";

export default {
  title: "Ltns Design/通用/Icon 图标",
  component: LtnsIcon,
};

const Template = (args, { argTypes }) => {
  console.log("LtnsIcon", args, argTypes);
  return {
    props: Object.keys(argTypes),
    components: { LtnsIcon },
    template: '<ltns-icon v-bind="$props"></ltns-icon>',
  };
};

export const Icon = Template.bind({});
Icon.args = {
  icon: "icon-xiayibu",
};
