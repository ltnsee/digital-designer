<template>
  <div class="add-node">
    <div class="add-node-btn">
      <el-popover v-model="visible" placement="right-start" popper-class="add-node-popover">
        <div class="add-node-popover-body">
          <a class="add-node-popover-item approver" @click="addType('approver')">
            <div class="item-wrapper">
              <span class="custom-iconfont el-icon-s-check" />
            </div>
            <span>审批人</span>
          </a>
          <a class="add-node-popover-item notifier" @click="addType('copy')">
            <div class="item-wrapper">
              <span class="custom-iconfont el-icon-s-promotion" />
            </div>
            <span>抄送人</span>
          </a>
          <a class="add-node-popover-item condition" @click="addType('router')">
            <div class="item-wrapper">
              <!-- <span class="custom-iconfont iconfont icon-tree" /> -->
              <svg-icon icon-class="tree" class-name="custom-iconfont" />
            </div>
            <span>条件分支</span>
          </a>
        </div>
        <button slot="reference" class="btn" type="button">
          <span class="custom-iconfont el-icon-plus" />
        </button>
      </el-popover>
    </div>
  </div>
</template>
<script>
export default {
  name: 'add-node',
  props: ['childNodeP'],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    addType(type) {
      this.visible = false;
      let data = null;
      switch (type) {
        case 'approver':
          data = {
            nodeName: '审核人',
            error: true,
            type: 'approver',
            setType: 1,
            selectMode: 0,
            selectRange: 0,
            directorLevel: 1,
            examineMode: 3,
            noHanderAction: 1,
            examineEndDirectorLevel: 0,
            childNode: this.childNodeP,
            nodeUserList: [],
          };
          break;
        case 'copy':
          data = {
            nodeName: '抄送人',
            type: 'copy',
            ccSelfSelectFlag: 0,
            childNode: this.childNodeP,
            nodeUserList: [],
          };
          break;
        case 'router':
          data = {
            nodeName: '路由',
            type: 'router',
            childNode: null,
            conditionNodes: [
              {
                nodeName: '条件1',
                error: true,
                type: 'condition',
                priorityLevel: 1,
                conditionList: [[{}]],
                childNode: this.childNodeP,
              },
              {
                nodeName: '条件2',
                type: 'condition',
                priorityLevel: 2,
                conditionList: [[{}]],
                childNode: null,
              },
            ],
          };
          break;
        default:
          data = null;
          break;
      }
      this.$emit('update:childNodeP', data);
    },
  },
};
</script>
<style lang="scss">
.add-node {
  width: 240px;
  display: inline-flex;
  flex-shrink: 0;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    margin: auto;
    width: 2px;
    height: 100%;
    background-color: #cacaca;
  }
  .add-node-btn {
    user-select: none;
    width: 240px;
    padding: 20px 0 32px;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    flex-grow: 1;
    .btn {
      outline: none;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
      width: 30px;
      height: 30px;
      background: #3296fa;
      border-radius: 50%;
      position: relative;
      border: none;
      line-height: 32px;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      cursor: pointer;
      .custom-iconfont {
        color: #fff;
        font-size: 16px;
      }
      &:hover {
        transform: scale(1.3);
        box-shadow: 0 13px 27px 0 rgba(0, 0, 0, 0.1);
      }
    }
  }
}
.add-node-popover {
  .add-node-popover-body {
    max-width: 270px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    padding: 10px 20px;
    .add-node-popover-item {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      color: #191f25;
      .item-wrapper {
        width: 60px;
        height: 60px;
        line-height: 56px;
        border: 1px solid #e5e5e5;
        border-radius: 30px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        font-size: 12px;
        cursor: pointer;
        margin-bottom: 4px;
        .custom-iconfont {
          font-size: 32px;
          vertical-align: middle;
        }
      }
      &.approver {
        color: #ff943e;
      }
      &.notifier {
        color: #3296fa;
      }
      &.condition {
        color: #15bc83;
      }
      &:hover {
        &.approver {
          .item-wrapper {
            color: #ffffff;
            background: #ff943e;
            border: 1px solid #ff943e;
            box-shadow: 0 2px 8px 0 #ff943e;
          }
        }
        &.notifier {
          .item-wrapper {
            color: #ffffff;
            background: #3296fa;
            border: 1px solid #3296fa;
            box-shadow: 0 2px 8px 0 #3296fa;
          }
        }
        &.condition {
          .item-wrapper {
            color: #ffffff;
            background: #15bc83;
            border: 1px solid #15bc83;
            box-shadow: 0 2px 8px 0 #15bc83;
          }
        }
      }
    }
  }
}
</style>
