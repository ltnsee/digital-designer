<template>
  <div class="select-user">
    <div class="selected-user-list">
      <div v-for="(item, index) in selectedEmp" :key="item.value" class="selected-user-item">
        <div class="user-portrait">{{ item.label }}</div>
        <div class="user-name">{{ item.label }}</div>
        <span class="user-cancel el-icon-close" @click="cancelSelectedEmp(item, index)" />
      </div>
      <el-button icon="el-icon-plus" round @click="dialogVisible = true">添加</el-button>
    </div>

    <el-dialog title="提示" :visible.sync="dialogVisible" top="8vh" width="760px" append-to-body custom-class="select-user-dialog" :before-close="handleClose">
      <div class="select-member-area">
        <div class="row select-member-panel">
          <div class="member-all">
            <div class="member-panel-header">
              <ul class="modal-tab">
                <li :class="{ active: showType == 1 }" @click="changeSelType(1)">
                  <a href="javascript:;">团队</a>
                </li>
                <li class="divider"></li>
                <li :class="{ active: showType == 2 }" @click="changeSelType(2)">
                  <a href="javascript:;">部门</a>
                </li>
              </ul>
            </div>
            <div class="member-panel-body">
              <div class="search-container">
                <div class="search-area-modal">
                  <i class="iconfont iconsearch" />
                  <input v-model="searchKey" type="text" placeholder="搜索成员..." @change="searchBySelType" />
                </div>
                <a class="btn-action" @click.stop="selectAll()">添加全部</a>
              </div>
              <div v-show="showType == 1">
                <ul class="member-list">
                  <li v-for="emp in searchEmp" :key="emp.value" class="member" @click="selectEmp(emp)">
                    <template v-if="!emp.checked">
                      <div class="lc-avatar" member="member" name="true" size="30">
                        <div class="lc-avatar-30" :title="emp.label">
                          <span class="lc-avatar-def">{{ emp.label }}</span>
                          <div class="lc-avatar-name">{{ emp.label }}</div>
                        </div>
                      </div>
                    </template>
                  </li>
                </ul>
              </div>
              <div v-show="showType == 2">
                <ul class="department-list">
                  <li>
                    <div class="lvl0" @click="rootNodeExpand = !rootNodeExpand">
                      <span :class="`icon-expand el-icon-caret-right ${rootNodeExpand ? 'opened' : ''}`" />
                      <span :class="`icon-type el-icon-folder${rootNodeExpand ? '-opened' : ''}`" />
                      <span class="title-warp">
                        <span class="title-name">{{ name }}</span>
                        <span class="title-desc">（ {{ empOptions.length }}人 ）</span>
                        <i class="el-icon-plus" title="添加整个公司成员" @click.stop="selectAll()"></i>
                      </span>
                    </div>
                    <ul v-show="rootNodeExpand" class="lvl-child">
                      <child-dept v-for="dept in getChildDept(0)" :key="dept.value" :dept="dept" :allemp="empOptions" :alldept="deptOptions" :lvl="1" />
                      <child-emp v-for="emp in getChildEmp(0)" :key="emp.value" :emp="emp" :allemp="empOptions" :lvl="1" />
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="member-arrow" />
          <div class="member-selected">
            <div class="member-panel-header">
              <span>已选择成员</span>
              <span class="header-meta">({{ getCheckedEmp().length }})</span>
            </div>
            <div class="member-panel-body">
              <ul class="member-list">
                <li v-for="emp in empOptions" :key="emp.value" class="member">
                  <template v-if="emp.checked">
                    <div class="lc-avatar" member="member" size="30" name="true">
                      <div class="lc-avatar-30" :title="emp.label">
                        <span class="lc-avatar-def">{{ emp.label }}</span>
                        <div class="lc-avatar-name">{{ emp.label }}</div>
                      </div>
                    </div>
                    <span class="btn-link-remove">
                      <i class="el-icon-delete" @click="selectEmp(emp)" />
                    </span>
                  </template>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="member-action">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="saveData()">保存</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ChildEmp from './child-emp';
import ChildDept from './child-dept';
export default {
  name: 'select-user',
  components: { ChildEmp, ChildDept },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    name: {
      type: String,
      default: '陕西创鑫商业保理有限公司',
    },
    id: String,
    value: {
      type: [String, Array, Number],
      required: true,
    },
    valueKey: {
      type: String,
      default: 'value',
    },
    labelKey: {
      type: String,
      default: 'label',
    },
    deptOptions: {
      type: Array,
      default: () => [],
    },
    empOptions: {
      type: Array,
      default: () => [],
    },
    multiple: Boolean,
    multipleLimit: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      dialogVisible: false,
      selectedEmp: [],
      showType: 1,
      rootNodeExpand: true,
      searchKey: '',
    };
  },
  computed: {
    searchEmp() {
      if (this.searchKey.trim() === '') {
        return this.empOptions;
      } else {
        return this.empOptions.filter((item) => {
          return item.label.indexOf(this.searchKey.trim()) !== -1;
        });
      }
    },
  },
  watch: {
    value: {
      handler: function () {
        this.resetSelectedEmp();
      },
      immediate: true,
    },
  },
  created() {},
  mounted() {},
  methods: {
    resetSelectedEmp() {
      this.selectedEmp = [];
      const newVal = this.value;
      if (newVal) {
        const valueType = typeof newVal;
        if (valueType === 'object' && newVal.length > 0) {
          for (let i = 0; i < this.empOptions.length; i++) {
            const emp = this.empOptions[i];
            if (emp && newVal.indexOf(emp.value) !== -1) {
              emp.checked = true;
              this.selectedEmp.push(emp);
            }
          }
        } else if (valueType === 'number' || valueType === 'string') {
          for (let i = 0; i < this.empOptions.length; i++) {
            const emp = this.empOptions[i];
            emp.checked = false;
            if (emp && emp.value === newVal) {
              emp.checked = true;
              this.selectedEmp.push(emp);
            }
          }
        } else {
          for (let i = 0; i < this.empOptions.length; i++) {
            const emp = this.empOptions[i];
            emp.checked = false;
          }
        }
      } else {
        for (let i = 0; i < this.empOptions.length; i++) {
          const emp = this.empOptions[i];
          emp.checked = false;
        }
      }
      console.log('resetSelectedEmp', this.empOptions, this.selectedEmp);
    },
    deptAssembly(dept, alldept, data = {}, layer = 0) {
      if (!data[layer]) {
        data[layer] = [];
      }
      if (dept.value !== 0 && layer === 0) {
        data[layer].push(dept.value);
      }

      if (alldept) {
        alldept.forEach((item) => {
          if (item && data[layer].indexOf(item.parentId) !== -1) {
            if (data[layer + 1]) {
              data[layer + 1].push(item.value);
            } else {
              data[layer + 1] = [item.value];
            }
          }
        });
      }
      layer++;
      if (data[layer] && data[layer].length > 0) {
        return this.deptAssembly(dept, alldept, data, layer);
      } else {
        let subArr = [];
        const empArr = [];
        Object.values(data).map((deptIds) => {
          if (deptIds && deptIds.length > 0) {
            subArr = subArr.concat(deptIds);
            this.empOptions.forEach((item) => {
              deptIds.forEach((d) => {
                if (d === item.deptId) {
                  empArr.push(item.value);
                }
              });
            });
          }
        });
        dept.sub = subArr;
        dept.emp = empArr;
        return dept;
      }
    },
    changeSelType(selType) {
      this.showType = selType;
    },
    searchBySelType() {},
    selectEmp(emp) {
      if (typeof emp.checked === 'undefined') {
        this.$set(emp, 'checked', true);
      } else {
        emp.checked = !emp.checked;
      }
    },
    selectAll() {
      this.empOptions.forEach((item) => {
        if (typeof item.checked === 'undefined' || !item.checked) {
          this.$set(item, 'checked', true);
        }
      });
    },
    getParentDept(pid) {
      return this.deptOptions.filter((item) => {
        return item.parentId === pid;
      });
    },
    getChildDept(pid) {
      return this.deptOptions.filter((item) => {
        return item.parentId === pid;
      });
    },
    getChildEmp(deptId) {
      return this.empOptions.filter((item) => {
        return item.deptId === deptId;
      });
    },
    getCheckedEmp() {
      return this.empOptions.filter((item) => item.checked);
    },
    cancelSelectedEmp(item, index) {
      for (let i = 0; i < this.empOptions.length; i++) {
        const emp = this.empOptions[i];
        if (emp && item && item.value === emp.value) {
          emp.checked = false;
          break;
        }
      }
      this.selectedEmp.splice(index, 1);
      const selectedEmpIds = this.selectedEmp.map((emp) => emp.value);
      if (this.multiple) {
        this.$emit('change', selectedEmpIds);
      } else {
        this.$emit('change', selectedEmpIds[0]);
      }
    },
    saveData() {
      this.empOptions.forEach((item) => {
        if (item.checked) {
          this.selectedEmp.push(item);
        }
      });
      const selectedEmpIds = this.selectedEmp.map((emp) => emp.value);
      if (this.multiple) {
        this.$emit('change', selectedEmpIds);
      } else {
        this.$emit('change', selectedEmpIds[0]);
      }
      this.dialogVisible = false;
    },
    handleClose() {
      this.dialogVisible = false;
    },
  },
};
</script>

<style scoped lang="scss">
.select-user {
  .selected-user-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    align-items: center;
    margin: -4px -6px;
    .selected-user-item {
      display: flex;
      align-items: center;
      background-color: #eef1f2;
      height: 26px;
      line-height: 18px;
      border-radius: 4px;
      padding: 4px;
      margin: 4px 6px;
      cursor: pointer;
      .user-portrait {
        float: left;
        width: 26px;
        height: 22px;
        padding: 2px;
        line-height: 24px;
        font-size: 12px;
        border-radius: 3px;
        margin-right: 6px;
        background-color: #1890ff;
        overflow: hidden;
        color: #fff;
        border-radius: 3px;
      }
      .user-name {
        margin-right: 6px;
      }
      .user-cancel {
        cursor: pointer;
        transition: color 0.15s linear;
        font-size: 14px;
        &:hover {
          color: #5cb6ff;
        }
      }
    }
    .el-button {
      height: 32px;
      margin: 4px 6px;
    }
  }
}
</style>
<style lang="scss">
.select-user-dialog {
  .el-dialog__body {
    padding-top: 10px;
    .select-member-area {
      width: 720px;
      .select-member-panel {
        display: flex;
        flex-direction: row;
        .member-all,
        .member-selected {
          flex: 1 1 0;
          width: 0;
        }
        .member-arrow {
          width: 40px;
          flex-grow: 0;
          flex-shrink: 0;
          text-align: center;
          margin-top: 180px;
          font-size: 26px;
          color: #8f8f8f;
        }
        .member-panel-header {
          margin-bottom: 10px;
          line-height: 24px;
          span {
            color: #7b8a9a;
            font-weight: 500;
            font-size: 16px;
          }
          .modal-tab {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: row;
            list-style: none;
            li {
              list-style: none;
              flex: 1 1 0;
              text-align: center;
              a {
                color: #dee1e2;
                font-size: 16px;
                display: block;
                font-size: 15px;
                line-height: 24px;
                &:focus,
                &:hover {
                  color: #b5bcbe;
                  text-decoration: none;
                }
              }
              &.active a {
                color: #6f8092;
              }
              &.divider {
                flex: 0 1 0;
                border-right: solid 1px #f3f3f3;
              }
            }
          }
        }
        .member-panel-body {
          border: 1px solid #f3f3f3;
          border-radius: 3px;
          padding: 5px;
          overflow: auto;
          height: 440px;
          .approvers {
            margin: 10px 0;
          }
          .member-list {
            list-style: none;
            margin: 0;
            padding: 0;
            li.group-title {
              list-style: none;
              padding-left: 5px;
              padding-top: 5px;
              padding-bottom: 5px;
              font-size: 13px;
              color: #c1c1c1;
            }
            li.member {
              list-style: none;
              position: relative;
              cursor: pointer;
              .lc-avatar {
                display: block;
                padding: 5px 10px;
                line-height: 30px;
                color: #333;
                border-radius: 3px;
                img,
                span {
                  float: left;
                  width: 30px;
                  height: 30px;
                  padding: 2px;
                  line-height: 26px;
                  font-size: 13px;
                  border-radius: 3px;
                  margin-right: 10px;
                  background-color: #1890ff;
                  color: #fff;
                }
              }
              .btn-link-remove {
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;
                transition: color 0.15s linear;
                i.lc-close {
                  font-size: 14px;
                }
                &:hover {
                  color: #5cb6ff;
                }
              }
            }
          }
          .department-list {
            list-style: none;
            margin: 0;
            padding: 0;
            li.group-title {
              list-style: none;
              padding-left: 5px;
              padding-top: 5px;
              padding-bottom: 5px;
              font-size: 13px;
              color: #c1c1c1;
            }
            .lvl0 {
              height: 40px;
              line-height: 28px;
              padding: 6px 10px;
              color: rgb(51, 51, 51);
              display: flex;
              flex-direction: row;
              cursor: pointer;
              .icon-expand {
                margin-right: 3px;
                font-size: 16px;
                line-height: 28px;
                color: rgb(143, 143, 143);
                transition: all 0.2s ease 0s;
                &.opened {
                  transform: rotate(90deg);
                }
                &:hover {
                  color: rgb(105, 105, 105);
                }
              }
              .icon-type {
                margin-right: 4px;
                font-size: 16px;
                line-height: 28px;
                color: rgb(143, 143, 143);
              }
              .title-warp {
                line-height: 25px;
                white-space: nowrap;
                text-overflow: ellipsis;
                flex: 1 1 0px;
                overflow: hidden;
                .title-name {
                  line-height: 28px;
                }
                .title-desc {
                  display: inline-block;
                  margin-left: 3px;
                  color: rgb(193, 193, 193);
                  font-size: 12px;
                  line-height: 28px;
                  vertical-align: top;
                }
                .el-icon-plus {
                  display: none;
                  margin-left: 3px;
                  margin-right: 3px;
                  font-size: 12px;
                  color: rgb(143, 143, 143);
                  font-weight: 500;
                  transition: all 0.2s ease 0s;
                }
              }
              &:hover {
                background: rgb(234, 234, 234);
                .title-warp {
                  .el-icon-plus {
                    display: inline-block;
                  }
                }
              }
            }
            .lvl-child {
              padding-left: 20px;
              list-style: none;
            }
            li {
              list-style: none;
              a {
                .title {
                  padding-top: 3px;
                  white-space: normal;
                  overflow: inherit;
                  white-space: inherit;
                  text-overflow: inherit;
                }
                .lvl0 {
                  padding-left: 10px !important;
                }
                .lvl1 {
                  padding-left: 30px !important;
                }
                .lvl2 {
                  padding-left: 50px !important;
                }
                .lvl3 {
                  padding-left: 70px !important;
                }
                i {
                  &.lc-add {
                    display: none;
                    font-size: 12px;
                  }
                  &.fa-building-o {
                    margin-top: 5px;
                    margin-right: 5px;
                    font-size: 14px;
                  }
                }
                &:hover i.lc-add {
                  display: inline-block;
                }
              }
              .lc-avatar {
                img,
                span {
                  margin-right: 5px;
                }
              }
            }
          }
          .search-container {
            position: relative;
            width: auto;
            margin-top: 0;
            .search-area,
            .search-area-modal {
              border-bottom: solid 1px #f3f3f3;
              padding: 5px 65px 5px 30px;
              height: 32px;
              position: relative;
              i.iconsearch {
                position: absolute;
                left: 7px;
                top: 3px;
                color: #d9d9d9;
              }
              input {
                display: block;
                width: 100%;
                border: 0;
                height: auto;
                padding-left: 1px;
                line-height: 22px;
                &:focus {
                  outline: 0;
                }
              }
            }
            .btn-action {
              position: absolute;
              top: 5px;
              right: 10px;
              color: #c8cfd4;
              &:focus,
              &:hover {
                color: #9daab2;
                text-decoration: none;
              }
            }
          }
          .approver-list {
            .approver-item {
              position: relative;
              .avatar-close {
                background-image: url(https://cdn.worktile.com/pro/image/app/lc-close.png);
                position: absolute;
                top: -6px;
                right: -2px;
                display: inline-block;
                width: 13px;
                height: 13px;
                background-size: cover;
                visibility: hidden;
                cursor: pointer;
              }
              &:hover {
                text-decoration: none;
                .avatar-close {
                  visibility: visible;
                }
              }
            }
          }
          .add-special-role-btn {
            margin: 10px 5px;
            button {
              margin: 0 15px;
            }
          }
        }
      }
      .member-action {
        margin-top: 20px;
        text-align: center;
      }
    }
  }
}
</style>
