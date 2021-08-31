<template>
  <div class="workflow">
    <el-dialog :visible.sync="dialogVisible" width="880px" fullscreen append-to-body :close-on-click-modal="false" custom-class="workflow-dialog" :before-close="handleClose">
      <div slot="title" class="header-nav">
        <div class="header-nav-left">
          <el-button size="mini" icon="el-icon-arrow-left" circle @click="handleClose" />
          <label>{{ formTitle }}</label>
        </div>
        <el-tabs v-model="activeName" class="header-nav-center">
          <el-tab-pane label="基础设置" name="basicSetting" />
          <!-- <el-tab-pane label="表单设计" name="formDesign" /> -->
          <el-tab-pane label="流程设计" name="processConfig" />
          <!-- <el-tab-pane label="高级设置" name="advancedSetting" /> -->
        </el-tabs>
        <div class="header-nav-right">
          <el-button size="mini" round @click="handleClose">取 消</el-button>
          <el-button type="primary" size="mini" round @click="handleSave">发 布</el-button>
        </div>
      </div>
      <div class="workflow-body">
        <basic-setting
          v-show="activeName === 'basicSetting'"
          ref="basicSetting"
          :conf="basicSetting"
          tab-name="basicSetting"
          :flow-key-options="flowKeyOptions"
          :flow-group-options="flowGroupOptions"
          @flowKeyChange="flowKeyChange"
        />
        <!-- <dynamic-form v-show="activeName === 'formDesign'" ref="formDesign" :conf="formDesignConfig" tab-name="formDesign" /> -->
        <process-config
          v-show="activeName === 'processConfig'"
          ref="processConfig"
          :conf="processConfig"
          :flow-key="flowKey"
          tab-name="processConfig"
          @fetchCondition="fetchCondition"
          @fetchUserList="fetchUserList"
          @fetchDeptList="fetchDeptList"
          @fetchRoleList="fetchRoleList"
        />
        <!-- <advanced-setting v-show="activeName === 'advancedSetting'" ref="advancedSetting" :conf="advancedSetting" tab-name="advancedSetting" /> -->
      </div>

      <el-dialog title="提示" :visible.sync="tipVisible" append-to-body width="520px" top="20vh" custom-class="workflow-tip-dialog">
        <i class="el-icon-error" />
        <span class="confirm-title">当前无法发布</span>
        <div class="confirm-content">
          <div>
            <p class="error-modal-desc">以下内容不完善，需进行修改</p>
            <div class="error-modal-list">
              <div v-for="(item, index) in tipList" :key="index" class="error-modal-item">
                <div class="error-modal-item-label">流程设计</div>
                <div class="error-modal-item-content">{{ item.name }} 未选择{{ item.type }}</div>
              </div>
            </div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="tipVisible = false">我知道了</el-button>
          <el-button type="primary" @click="tipVisible = false">前往修改</el-button>
        </span>
      </el-dialog>
    </el-dialog>
  </div>
</template>

<script>
const addObj = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({}));
  });
};
const defaultProcessConfig = {
  pkId: 'start',
  nodeName: '发起人',
  type: 'start',
  childNode: null,
  nodeUserList: [],
};
export default {
  name: 'workflow',
  props: {
    formTitle: {
      type: String,
      default: '',
    },
    dialogVisible: {
      type: Boolean,
      default: true,
    },
    // formData: {
    //   type: Object,
    //   default: () => {},
    // },
  },
  data() {
    return {
      formData: {},
      tipList: [],
      tipVisible: false,
      flowKeyOptions: [],
      flowGroupOptions: [],
      flowKey: 'default',
      basicSetting: { state: 1 },
      formDesignConfig: {},
      processConfig: {},
      advancedSetting: {},
      activeName: 'basicSetting',
      form: {},
      rules: {},
      submitDisabled: false,
    };
  },
  computed: {},
  watch: {
    dialogVisible: 'reset',
  },
  created() {},
  mounted() {
    this.reset();
    this.fetchFlowKey();
    this.fetchFlowGroup();
  },
  methods: {
    reset() {
      if (this.dialogVisible) {
        const formData = JSON.parse(JSON.stringify(this.formData));
        this.nodeConfigDeleteEnd(formData.processConfig);
        this.nodeConfigToArray(formData.processConfig);
        this.flowKey = formData.basicSetting ? formData.basicSetting.flowKey : 'default';
        this.basicSetting = formData.basicSetting || { state: 1 };
        this.formDesignConfig = formData.formDesignConfig || {};
        this.processConfig = formData.processConfig || defaultProcessConfig;
        this.advancedSetting = formData.advancedSetting || {};
      }
    },
    handleClose() {
      this.$emit('closeDialog', false);
    },
    nodeConfigDeleteEnd(nodeConfig) {
      if (nodeConfig && nodeConfig.childNode) {
        if (nodeConfig.childNode.type === 'end') {
          nodeConfig.childNode = null;
        } else {
          this.nodeConfigDeleteEnd(nodeConfig.childNode);
        }
      }
    },
    nodeConfigToArray(nodeConfig) {
      if (nodeConfig) {
        if (nodeConfig.childNode) {
          this.nodeConfigToArray(nodeConfig.childNode);
        }
        if (nodeConfig.conditionNodes) {
          nodeConfig.conditionNodes = nodeConfig.conditionNodes.map((c) => {
            this.nodeConfigToArray(c.childNode);
            try {
              c.conditionList = c.conditionList ? JSON.parse(c.conditionList) : [];
              return c;
            } catch (err) {
              console.log('数据格式不合法：', err);
            }
          });
        }
      }
    },
    flowKeyChange(flowKey) {
      this.flowKey = flowKey || 'default';
    },

    handleSave() {
      // 校验基础设置
      const p1 = this.$refs['basicSetting'].getData();
      const p2 = this.$refs['processConfig'].getData();
      Promise.all([p1, p2])
        .then((res) => {
          const params = {
            basicSetting: res[0].formData,
            processConfig: res[1].formData,
            formDesignConfig: {},
            advancedSetting: {},
          };
          addObj(params).then(() => {
            this.$message.success('添加成功');
            this.$emit('closeDialog', true);
          });
        })
        .catch((err) => {
          if (err.target) {
            this.activeName = err.target;
            if (err.target === 'processConfig') {
              this.tipVisible = err.tipList && err.tipList.length > 0;
              this.tipList = err.tipList;
            }
          }
        });
    },
    // 获取流程类型
    fetchFlowKey() {
      return new Promise(() => {
        setTimeout(() => {
          this.flowKeyOptions = [
            { processKey: 1, processName: 'test1' },
            { processKey: 2, processName: 'test2' },
          ];
        }, 300);
      });
    },
    // 获取流程分组
    fetchFlowGroup() {
      return new Promise(() => {
        setTimeout(() => {
          this.flowGroupOptions = [
            { id: 1, categoryName: 'test1' },
            { id: 2, categoryName: 'test2' },
          ];
        }, 300);
      });
    },
    // 获取条件
    fetchCondition(cb) {
      return new Promise((resolve) => {
        setTimeout(
          () =>
            resolve([
              {
                id: 0,
                processDefinitionKey: null,
                fieldLabel: '发起人',
                fieldName: 'starterUser',
                fieldType: 'starterUser',
                canditionOptions: [
                  {
                    label: '包含',
                    value: 'in',
                  },
                  {
                    label: '不包含',
                    value: 'nin',
                  },
                ],
                component: 'select',
                dictOptions: null,
              },
              {
                id: 4,
                processDefinitionKey: null,
                fieldLabel: '请假时长',
                fieldName: 'test',
                fieldType: 'number',
                canditionOptions: [
                  {
                    label: '大于',
                    value: 'gt',
                  },
                  {
                    label: '小于',
                    value: 'lt',
                  },
                  {
                    label: '等于',
                    value: 'eq',
                  },
                  {
                    label: '大于等于',
                    value: 'gt_eq',
                  },
                  {
                    label: '小于等于',
                    value: 'lt_eq',
                  },
                ],
                component: 'input',
                dictOptions: null,
              },
              {
                id: 9,
                processDefinitionKey: null,
                fieldLabel: '请假类型',
                fieldName: 'leaveType',
                fieldType: 'array',
                canditionOptions: [
                  {
                    label: '包含',
                    value: 'in',
                  },
                  {
                    label: '不包含',
                    value: 'nin',
                  },
                ],
                component: 'select',
                dictOptions: [
                  {
                    label: '事件',
                    value: '1',
                  },
                  {
                    label: '年假',
                    value: '2',
                  },
                  {
                    label: '病假',
                    value: '3',
                  },
                  {
                    label: '婚假',
                    value: '4',
                  },
                ],
              },
              {
                id: 10,
                processDefinitionKey: null,
                fieldLabel: '字段1',
                fieldName: 'field01',
                fieldType: 'string',
                canditionOptions: [
                  {
                    label: '大于',
                    value: 'gt',
                  },
                  {
                    label: '小于',
                    value: 'lt',
                  },
                  {
                    label: '等于',
                    value: 'eq',
                  },
                ],
                component: 'input',
                dictOptions: null,
              },
              {
                id: 11,
                processDefinitionKey: null,
                fieldLabel: '字段2',
                fieldName: 'field02',
                fieldType: 'date',
                canditionOptions: [
                  {
                    label: '大于',
                    value: 'gt',
                  },
                  {
                    label: '小于',
                    value: 'lt',
                  },
                  {
                    label: '等于',
                    value: 'eq',
                  },
                ],
                component: 'input',
                dictOptions: null,
              },
              {
                id: 12,
                processDefinitionKey: null,
                fieldLabel: '字段3',
                fieldName: 'field03',
                fieldType: 'boolean',
                canditionOptions: [
                  {
                    label: '大于',
                    value: 'gt',
                  },
                  {
                    label: '小于',
                    value: 'lt',
                  },
                  {
                    label: '等于',
                    value: 'eq',
                  },
                ],
                component: 'input',
                dictOptions: null,
              },
            ]),
          300
        );
      }).then(cb);
    },
    // 获取用户列表
    fetchUserList(params, cb) {
      return new Promise((resolve) => {
        console.log('fetchUserList', params);
        setTimeout(
          () =>
            resolve([
              { value: 1, label: 'test1' },
              { value: 2, label: 'test2' },
            ]),
          300
        );
      }).then(cb);
    },
    // 获取部门列表
    fetchDeptList(params, cb) {
      return new Promise((resolve) => {
        console.log('fetchDeptList', params);
        setTimeout(
          () =>
            resolve([
              { value: 1, label: 'test1' },
              { value: 2, label: 'test2' },
            ]),
          300
        );
      }).then(cb);
    },
    // 获取角色
    fetchRoleList(params, cb) {
      return new Promise((resolve) => {
        console.log('fetchRoleList', params);
        setTimeout(
          () =>
            resolve([
              { value: 1, label: 'test1' },
              { value: 2, label: 'test2' },
            ]),
          300
        );
      }).then(cb);
    },
  },
};
</script>
<style lang="scss">
.workflow-dialog {
  .el-dialog__header {
    padding: 0;
    .el-dialog__headerbtn {
      display: none;
    }
    .header-nav {
      z-index: 11;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 54px;
      padding: 0 20px 0 20px;
      background: #fff;
      box-shadow: 0 1px 4px 0 rgba(17, 31, 44, 0.04);
      .header-nav-left {
        display: flex;
        align-items: center;
        .el-button {
          margin-right: 12px;
        }
      }
      .header-nav-center {
        position: relative;
        display: inline-block;
        align-items: center;
        justify-content: center;
        .el-tabs__header {
          margin: 0;
          .el-tabs__nav-wrap {
            .el-tabs__nav-scroll {
              .el-tabs__nav {
                .el-tabs__active-bar {
                  width: 56px !important;
                }
                .el-tabs__item {
                  height: 54px;
                  line-height: 54px;
                }
              }
            }
            &::after {
              display: none;
            }
          }
        }
      }
      .header-nav-right {
        display: flex;
        align-items: center;
        .el-button {
          font-size: 14px;
          &.el-button--mini.is-round {
            padding: 6px 15px;
          }
        }
      }
    }
  }
  .el-dialog__body {
    .workflow-body {
      position: fixed;
      top: 54px;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}
.workflow-tip-dialog {
  .el-dialog__header {
    padding: 0 0 0 20px;
    line-height: 50px;
    height: 50px;
    background: #fff;
    border-bottom: 1px solid #f2f2f2;
    .el-dialog__title {
      font-size: 16px;
      line-height: 50px;
      color: #333;
    }
  }
  .el-dialog__body {
    .el-icon-error {
      font-size: 22px;
      margin-right: 16px;
      float: left;
      color: #f00;
    }
    .confirm-title {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      font-size: 16px;
      line-height: 1.4;
      display: inline-block;
      overflow: hidden;
    }
    .confirm-content {
      margin-left: 38px;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      margin-top: 8px;
      .error-modal-desc {
        font-size: 13px;
        color: rgba(25, 31, 37, 0.56);
        line-height: 22px;
        margin-bottom: 14px;
      }
      .error-modal-list {
        height: 200px;
        overflow-y: auto;
        .error-modal-item {
          padding: 10px 20px;
          line-height: 21px;
          background: #f6f6f6;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          border-radius: 4px;
          .error-modal-item-label {
            flex: none;
            font-size: 15px;
            color: rgba(25, 31, 37, 0.56);
            padding-right: 10px;
          }
          .error-modal-item-content {
            text-align: right;
            flex: 1;
            font-size: 13px;
            color: #191f25;
          }
        }
      }
    }
  }
  .el-dialog__footer {
    border-top: 1px solid #f2f2f2;
    padding-bottom: 10px;
  }
}
</style>
