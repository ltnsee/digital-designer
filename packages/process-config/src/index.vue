<template>
  <div class="process-config">
    <div class="zoom">
      <div :class="'zoom-out' + (nowVal === 50 ? ' disabled' : '')" @click="zoomSize(1)">
        <i class="el-icon-minus" />
      </div>
      <span>{{ nowVal }}%</span>
      <div :class="'zoom-in' + (nowVal === 300 ? ' disabled' : '')" @click="zoomSize(2)">
        <i class="el-icon-plus" />
      </div>
    </div>
    <div id="scale-box" class="scale-box" :style="`transform: scale(${nowVal / 100}); transform-origin: 50% 0px 0px;`">
      <node-wrap :node-config.sync="nodeConfig" :is-tried.sync="isTried" :conditions="conditionsList" :director-max-level="directorMaxLevel" />
      <div class="end-node">
        <div class="end-node-circle"></div>
        <div class="end-node-text">流程结束</div>
      </div>
    </div>
  </div>
</template>

<script>
import NodeWrap from './node-wrap';
export default {
  name: 'process-config',
  components: { NodeWrap },
  props: ['tabName', 'flowKey', 'conf'],
  provide() {
    return {
      process: this,
    };
  },
  data() {
    return {
      isTried: true,
      nowVal: 100,
      tipList: [],
      nodeConfig: {},
      conditionsList: [],
      directorMaxLevel: 1,
    };
  },
  computed: {},
  watch: {
    conf: function (val) {
      this.nodeConfig = JSON.parse(JSON.stringify(val));
    },
    flowKey: 'getConditionsList',
  },
  created() {
    this.nodeConfig = JSON.parse(JSON.stringify(this.conf));
    this.getConditionsList();
  },
  mounted() {},
  methods: {
    getConditionsList() {
      this.$emit('fetchCondition', (data) => {
        this.conditionsList = data || [];
      });
    },
    renderErr(data) {
      if (data && data.childNode) {
        if (data.childNode.type === 'approver') {
          if (data.childNode.error) {
            this.tipList.push({
              name: data.childNode.nodeName,
              type: '审核人',
            });
          }
          this.renderErr(data.childNode);
        } else if (data.childNode.type === 'copy') {
          if (data.childNode.error) {
            this.tipList.push({
              name: data.childNode.nodeName,
              type: '抄送人',
            });
          }
          this.renderErr(data.childNode);
        } else if (data.childNode.type === 'router') {
          this.renderErr(data.childNode);
          for (var i = 0; i < data.childNode.conditionNodes.length; i++) {
            if (data.childNode.conditionNodes[i].error) {
              this.tipList.push({
                name: data.childNode.conditionNodes[i].nodeName,
                type: '条件',
              });
            }
            this.renderErr(data.childNode.conditionNodes[i]);
          }
        }
      } else {
        data.childNode = null;
      }
    },
    nodeConfigAddEnd(nodeConfig) {
      if (nodeConfig && nodeConfig.childNode) {
        this.nodeConfigAddEnd(nodeConfig.childNode);
      } else {
        nodeConfig.childNode = {
          type: 'end',
          pkId: 'end',
          nodeName: '流程结束',
        };
      }
    },
    nodeConfigToString(nodeConfig) {
      if (nodeConfig) {
        if (nodeConfig.childNode) {
          this.nodeConfigToString(nodeConfig.childNode);
        }
        if (nodeConfig.conditionNodes) {
          nodeConfig.conditionNodes = nodeConfig.conditionNodes.map((c) => {
            this.nodeConfigToString(c.childNode);
            c.conditionList = c.conditionList ? JSON.stringify(c.conditionList) : '';
            return c;
          });
        }
      }
    },
    getData() {
      this.tipList = [];
      const nodeConfig = JSON.parse(JSON.stringify(this.nodeConfig));
      this.renderErr(nodeConfig);
      this.nodeConfigAddEnd(nodeConfig);
      this.nodeConfigToString(nodeConfig);
      if (this.tipList.length > 0) {
        return Promise.reject({ target: this.tabName, tipList: this.tipList });
      } else {
        return Promise.resolve({ formData: nodeConfig });
      }
    },
    zoomSize(type) {
      if (type === 1) {
        if (this.nowVal === 50) {
          return;
        }
        this.nowVal -= 10;
      } else {
        if (this.nowVal === 300) {
          return;
        }
        this.nowVal += 10;
      }
    },
  },
};
</script>
<style lang="scss">
.process-config {
  width: 100%;
  background-color: #f5f5f7;
  overflow: auto;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  .zoom {
    display: flex;
    position: fixed;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    width: 125px;
    right: 40px;
    margin-top: 30px;
    z-index: 10;
    .zoom-out,
    .zoom-in {
      width: 30px;
      height: 30px;
      background: #fff;
      color: #606266;
      cursor: pointer;
      line-height: 30px;
      text-align: center;
      font-size: 16px;
    }
  }
  .scale-box {
    transform: scale(1);
    display: inline-block;
    position: relative;
    width: 100%;
    padding: 54.5px 0;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    min-width: min-content;
    background-color: #f5f5f7;
    transform-origin: 0 0 0;
    .end-node {
      border-radius: 50%;
      font-size: 14px;
      color: rgba(25, 31, 37, 0.4);
      text-align: left;
      .end-node-circle {
        width: 10px;
        height: 10px;
        margin: auto;
        border-radius: 50%;
        background: #dbdcdc;
      }
      .end-node-text {
        margin-top: 5px;
        text-align: center;
      }
    }
  }
}
</style>
