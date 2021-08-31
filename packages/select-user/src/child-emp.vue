<template>
  <li class="child-emp" @click.stop="selectEmp(emp)">
    <div class="child-emp-item" :class="lvl | level">
      <el-checkbox v-model="emp.checked" @change="() => selectEmp(emp)" />
      <div class="lc-avatar" member="member" name="true" size="30">
        <div class="lc-avatar-30" :title="emp.label">
          <span class="lc-avatar-def">{{ emp.label }}</span>
          <div class="lc-avatar-name">{{ emp.label }}</div>
        </div>
      </div>
    </div>
  </li>
</template>

<script>
export default {
  name: 'child-emp',
  components: {},
  filters: {
    level(le) {
      return 'lvl' + le;
    },
  },
  props: ['emp', 'allemp', 'lvl'],
  data() {
    return {};
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    selectEmp(emp) {
      if (typeof emp.checked === 'undefined') {
        this.$set(emp, 'checked', true);
      } else {
        emp.checked = !emp.checked;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.child-emp {
  .child-emp-item {
    padding-left: 6px;
    list-style-type: none;
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    .lc-avatar {
      flex: 1;
      display: block;
      padding: 2px 10px;
      line-height: 30px;
      color: #333;
      border-radius: 3px;
      img,
      span {
        float: left;
        width: 28px;
        height: 28px;
        padding: 2px;
        line-height: 24px;
        font-size: 12px;
        border-radius: 3px;
        margin-right: 10px;
        background-color: #1890ff;
        color: #fff;
        overflow: hidden;
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
    &:hover {
      background: rgb(234, 234, 234);
    }
  }
}
</style>
