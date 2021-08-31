<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分组名称" prop="categoryName">
        <el-input v-model="queryParams.categoryName" placeholder="请输入分组名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="租户ID" prop="tenantId">
        <el-input v-model="queryParams.tenantId" placeholder="请输入租户ID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="创建人" prop="createUser">
        <el-input v-model="queryParams.createUser" placeholder="请输入创建人" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="更新人" prop="updateUser">
        <el-input v-model="queryParams.updateUser" placeholder="请输入更新人" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['yourModuleName:category:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['yourModuleName:category:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['yourModuleName:category:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['yourModuleName:category:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="categoryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="分组名称" align="center" prop="categoryName" />
      <el-table-column label="租户ID" align="center" prop="tenantId" />
      <el-table-column label="创建人" align="center" prop="createUser" />
      <el-table-column label="更新人" align="center" prop="updateUser" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['yourModuleName:category:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['yourModuleName:category:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改流程分组配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="960px" :close-on-click-modal="false" append-to-body custom-class="form-details-dialog-custom-class">
      <div slot="title" class="dialog-title">
        <div class="reimbursement-dialog-title">
          <p class="zh">{{ title }}</p>
          <p class="en">English Title Here</p>
        </div>
      </div>
      <el-form ref="form" :model="form" :rules="rules" size="small" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="分组名称" prop="categoryName">
              <el-input v-model="form.categoryName" placeholder="请输入分组名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租户ID" prop="tenantId">
              <el-input v-model="form.tenantId" placeholder="请输入租户ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="删除标志" prop="delFlag">
              <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建人" prop="createUser">
              <el-input v-model="form.createUser" placeholder="请输入创建人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新人" prop="updateUser">
              <el-input v-model="form.updateUser" placeholder="请输入更新人" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 流程分类管理
import request from '@/utils/request';

// 查询流程分组配置列表
export function listCategory(query) {
  return request({
    url: '/yourModuleName/category/list',
    method: 'get',
    params: query,
  });
}

// 查询流程分组配置详细
export function getCategory(id) {
  return request({
    url: '/yourModuleName/category/' + id,
    method: 'get',
  });
}

// 新增流程分组配置
export function addCategory(data) {
  return request({
    url: '/yourModuleName/category',
    method: 'post',
    data: data,
  });
}

// 修改流程分组配置
export function updateCategory(data) {
  return request({
    url: '/yourModuleName/category',
    method: 'put',
    data: data,
  });
}

// 删除流程分组配置
export function delCategory(id) {
  return request({
    url: '/yourModuleName/category/' + id,
    method: 'delete',
  });
}

// 导出流程分组配置
export function exportCategory(query) {
  return request({
    url: '/yourModuleName/category/export',
    method: 'get',
    params: query,
  });
}

export default {
  name: 'Category',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 流程分组配置表格数据
      categoryList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        categoryName: null,
        tenantId: null,
        createUser: null,
        updateUser: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        delFlag: [{ required: true, message: '删除标志不能为空', trigger: 'blur' }],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询流程分组配置列表 */
    getList() {
      this.loading = true;
      listCategory(this.queryParams).then((response) => {
        this.categoryList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        categoryName: null,
        tenantId: null,
        delFlag: null,
        createUser: null,
        createTime: null,
        updateUser: null,
        updateTime: null,
      };
      this.resetForm('form');
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = '添加流程分组配置';
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getCategory(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = '修改流程分组配置';
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功');
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCategory(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功');
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除流程分组配置编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return delCategory(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess('删除成功');
        })
        .catch(function () {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有流程分组配置数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return exportCategory(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        })
        .catch(function () {});
    },
  },
};
</script>
