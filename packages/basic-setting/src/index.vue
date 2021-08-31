<template>
  <div class="basic-setting-warp">
    <div class="basic-setting">
      <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-position="top">
        <el-form-item label="审批名称" prop="flowName">
          <el-input v-model="formData.flowName" placeholder="请输入审批名称" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="流程类型" prop="flowKey">
          <el-select v-model="formData.flowKey" placeholder="请选择流程类型" clearable style="width: 100%" @change="flowKeyChange">
            <el-option v-for="(item, index) in flowKeyOptions" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="流程分组" prop="flowGroup">
          <el-select v-model="formData.flowGroup" placeholder="请选择流程分组" clearable style="width: 100%">
            <el-option v-for="(item, index) in flowGroupOptions" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批说明" prop="flowRemark">
          <el-input v-model="formData.flowRemark" type="textarea" placeholder="请输入审批说明" :maxlength="100" show-word-limit :autosize="{ minRows: 4, maxRows: 4 }" style="width: 100%" />
        </el-form-item>
        <!-- <el-form-item label="模板图标" prop="flowImg">
					<img
						:src="activeIconSrc"
						style="width: 28px; height: 28px; vertical-align: middle"
					/>
					<el-button
						plain
						size="mini"
						style="margin-left: 10px"
						@click="dialogVisible = true"
						>选择图标</el-button
					>
				</el-form-item>
        <el-form-item label="撤回设置" prop="flowGroup">
          <el-select v-model="formData.flowGroup" placeholder="请选择选择分组" clearable style="width: 100%" @change="flowGroupChange">
            <el-option v-for="(item, index) in flowGroupOptions" :key="index" :label="item.flowName" :value="item.flowKey" :disabled="item.disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动提交规则" prop="flowGroup">
          <el-select v-model="formData.flowGroup" placeholder="请选择选择分组" clearable style="width: 100%" @change="flowGroupChange">
            <el-option v-for="(item, index) in flowGroupOptions" :key="index" :label="item.flowName" :value="item.flowKey" :disabled="item.disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知抄送人" prop="flowGroup">
          <el-select v-model="formData.flowGroup" placeholder="请选择选择分组" clearable style="width: 100%" @change="flowGroupChange">
            <el-option v-for="(item, index) in flowGroupOptions" :key="index" :label="item.flowName" :value="item.flowKey" :disabled="item.disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="开启审批" prop="value" class="horizontal">
          <el-switch v-model="formData.value" />
        </el-form-item>
        <el-form-item label="允许流程发起人催办" prop="value" class="horizontal">
          <el-switch v-model="formData.value" />
        </el-form-item>
        <el-form-item label="允许查看流程日志和流转图" prop="value" class="horizontal">
          <el-switch v-model="formData.value" />
        </el-form-item>
        <el-form-item label="允许拒绝后修改并重新发起审批" prop="value" class="horizontal">
          <el-switch v-model="formData.value" />
        </el-form-item> -->
      </el-form>
      <!-- <el-dialog title="选择图标" :visible.sync="dialogVisible" append-to-body width="612px">
				<img
					v-for="(icon, index) in iconList"
					:key="index"
					:src="icon.src"
					class="icon-item"
					:class="{ active: selectedIcon === icon.id }"
					@click="selectedIcon = icon.id"
				/>
				<span slot="footer" class="dialog-footer">
					<el-button
						size="small"
						@click="
							dialogVisible = false;
							selectedIcon = activeIcon;
						"
					>
						取 消
					</el-button>
					<el-button
						type="primary"
						size="small"
						@click="
							dialogVisible = false;
							activeIcon = selectedIcon;
						"
					>
						确 定
					</el-button>
				</span>
			</el-dialog> -->
    </div>
  </div>
</template>

<script>
// import { listFlowConfig } from '@/api/activiti/flowConfig';
export default {
  name: 'basic-setting',
  components: {},
  props: ['tabName', 'flowKeyOptions', 'flowGroupOptions', 'conf'],
  data() {
    // const req = require.context('@/assets/image/approverIcon', false, /\.png$/);
    const iconList = []; // req.keys().map((t, idx) => ({ src: req(t), id: idx }));
    return {
      dialogVisible: false,
      // activeIcon: iconList[0].id,
      // selectedIcon: iconList[0].id,
      formData: {
        flowName: '',
        flowImg: '',
        flowKey: undefined,
        flowGroup: undefined,
        flowRemark: undefined,
      },
      rules: {
        flowName: [{ required: true, message: '请输入审批名称', trigger: 'blur' }],
        flowKey: [{ required: true, message: '请选择流程类型', trigger: 'change' }],
      },
      iconList,
    };
  },
  computed: {
    // activeIconSrc() {
    //   const icon = this.iconList.find((t) => t.id === this.activeIcon);
    //   if (icon) {
    //     this.formData.flowImg = icon.src;
    //     return icon.src;
    //   }
    //   return "";
    // },
  },
  watch: {
    conf: function () {
      this.$refs['elForm'].resetFields();
      this.formData = JSON.parse(JSON.stringify(this.conf));
    },
  },
  created() {
    this.formData = JSON.parse(JSON.stringify(this.conf));
  },
  methods: {
    flowKeyChange(item) {
      this.$emit('flowKeyChange', item);
    },
    // 给父级页面提供得获取本页数据得方法
    getData() {
      return new Promise((resolve, reject) => {
        this.$refs['elForm'].validate((valid) => {
          if (valid) {
            this.formData.flowImg = this.activeIcon;
            resolve({ formData: this.formData, target: this.tabName });
          } else {
            reject({ target: this.tabName });
          }
        });
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.icon-item {
  opacity: 0.5;
  width: 40px;
  height: 40px;
  margin: 6px;
  position: relative;
  cursor: pointer;
  &.active {
    opacity: 1;
  }
  &:hover {
    opacity: 1;
  }
}

.basic-setting-warp {
  width: 100%;
  min-height: 100%;
  padding: 20px 0;
  box-sizing: border-box;
  background: #f5f5f7;
  .basic-setting {
    width: 800px;
    margin: auto;
    background: #fff;
    padding: 16px 50px;
    /deep/ .el-form--label-top {
      .el-form-item {
        .el-form-item__label {
          padding-bottom: 0;
        }
        &.horizontal {
          .el-form-item__label {
            float: left;
          }
          .el-form-item__content {
            float: right;
          }
        }
      }
    }
  }
}
</style>
