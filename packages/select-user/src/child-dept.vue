<template>
  <li class="child-dept">
    <div class="child-dept-item" :class="lvl | level" @click.stop="expandDept">
      <span :class="`icon-expand el-icon-caret-right ${deptExpand ? 'opened' : ''}`" />
      <span :class="`icon-type el-icon-folder${deptExpand ? '-opened' : ''}`" />
      <span class="title-warp">
        <span class="title-name">{{ dept.label }}</span>
        <span class="title-desc" v-if="dept.emp">（ {{ dept.emp.length }}人 ）</span>
        <!-- <span class="title-desc">（ {{ getAllChildEmp(dept.value).length }}人 ）</span> -->
        <i class="el-icon-plus" title="添加整个部门成员" @click.stop="selectDeptEmp(dept)"></i>
      </span>
    </div>
    <ul v-show="deptExpand" class="lvl-child">
      <child-dept v-for="(childDept, index) in getChildDept(dept.value)" :key="`${dept.value}dept${index}`" :dept="childDept" :allemp="allemp" :alldept="alldept" :lvl="lvl + 1" />
      <child-emp v-for="(childEmp, index) in getChildEmp(dept.value)" :key="`${dept.value}emp${index}`" :emp="childEmp" :allemp="allemp" :lvl="lvl + 1" />
    </ul>
  </li>
</template>

<script>
// import { formatDate } from '@fullcalendar/vue';
import ChildEmp from './child-emp';
export default {
  name: 'child-dept',
  components: { ChildEmp },
  filters: {
    level(le) {
      return 'lvl' + le;
    },
  },
  props: ['dept', 'allemp', 'alldept', 'lvl'],
  data() {
    return {};
  },
  computed: {
    deptExpand() {
      if (typeof this.dept.expand === 'undefined') {
        return this.lvl < 2;
      } else {
        return this.dept.expand;
      }
    },
  },
  watch: {},
  created() {},
  mounted() {},
  methods: {
    selectDeptEmp(dept) {
      const empIds = dept.emp;
      if (this.allemp) {
        this.allemp.forEach((item) => {
          if (empIds.indexOf(item.value) !== -1) {
            if (typeof item.checked === 'undefined') {
              this.$set(item, 'checked', true);
            } else {
              item.checked = !item.checked;
              // item.checked = true;
            }
          }
        });
      }
    },
    getChildEmp(deptId) {
      if (this.allemp) {
        return this.allemp.filter((item) => item.deptId === deptId);
      }
      return [];
    },
    getAllChildEmp(deptId) {
      var deptIds = [];
      if (deptId !== 0) {
        deptIds.push(deptId);
      }
      if (this.alldept) {
        this.alldept.forEach((item) => {
          if (item.parentId === deptId) {
            deptIds.push(item.value);
          }
        });
      }
      var allempids = [];
      if (this.allemp) {
        this.allemp.forEach((item) => {
          deptIds.forEach((d) => {
            if (d === item.deptId) {
              allempids.push(item.value);
            }
          });
        });
      }
      return allempids;
    },
    getChildDept(pid) {
      if (this.alldept) {
        return this.alldept.filter((item) => item.parentId === pid);
      }
      return [];
    },
    expandDept() {
      if (typeof this.dept.expand === 'undefined') {
        this.$set(this.dept, 'expand', true);
      } else {
        this.dept.expand = !this.dept.expand;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.child-dept {
  .child-dept-item {
    height: 34px;
    line-height: 28px;
    padding: 3px 10px;
    padding-left: 0;
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
}
</style>
