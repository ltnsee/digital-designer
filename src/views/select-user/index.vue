<template>
  <div class="select-user">
    <div style="margin: 10px 20px">
      <p>选择人员部门 -- 单选</p>
      <select-user v-model="userId" :empOptions="empOptions" :deptOptions="deptOptions" />
    </div>
    <div style="margin: 10px 20px">
      <p>选择人员部门 -- 多选</p>
      <select-user v-model="userIds" :empOptions="empOptions" :deptOptions="deptOptions" multiple />
    </div>
  </div>
</template>

<script>
import { getEmployeeList, getDepartmentList } from './data';
export default {
  components: {},
  props: {},
  data() {
    return {
      userId: 56,
      userIds: [56, 82],
      empOptions: [],
      deptOptions: [],
    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {
    this.empOptions = getEmployeeList();
    this.deptOptions = getDepartmentList();
  },
  methods: {},
};
</script>

<style scoped lang="scss"></style>
