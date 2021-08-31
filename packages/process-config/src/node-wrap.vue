<template>
  <div>
    <div v-if="nodeConfig.type !== 'router'" class="node-wrap">
      <div class="node-wrap-box" :class="(nodeConfig.type === 'start' ? 'start-node ' : '') + (isTried && nodeConfig.error ? 'active error' : '')">
        <div class="start-title" :style="startTitleStyle">
          <span v-show="nodeConfig.type === 'approver'" class="iconfont el-icon-s-check" />
          <span v-show="nodeConfig.type === 'copy'" class="iconfont el-icon-s-promotion" />
          <span v-if="!isInput" :class="`editable-title ${nodeConfig.type}`" @click="clickEvent()">{{ nodeConfig.nodeName }}</span>
          <input v-if="isInput" v-model="nodeConfig.nodeName" v-focus type="text" class="el-input__inner" @blur="blurEvent()" @focus="$event.currentTarget.select()" />
          <i v-if="nodeConfig.type !== 'start'" class="iconfont el-icon-close" @click="delNode()"></i>
        </div>
        <div class="content" @click="setPerson">
          <div v-if="nodeConfig.type === 'start'" class="text">
            {{ startStr(nodeConfig) || '所有人' }}
          </div>
          <div v-if="nodeConfig.type === 'approver'" class="text">
            <span class="placeholder">{{ setApproverStr(nodeConfig) || '请选择' }}</span>
          </div>
          <div v-if="nodeConfig.type === 'copy'" class="text">
            <span class="placeholder">{{ copyerStr(nodeConfig) || '请选择' }}</span>
          </div>
          <i class="iconfont arrow el-icon-arrow-right"></i>
        </div>
        <div v-if="isTried && nodeConfig.error" class="error_tip">
          <i class="el-icon-warning-outline" style="color: rgb(242, 86, 67)"></i>
        </div>
      </div>
      <add-node :child-node-p.sync="nodeConfig.childNode" />
    </div>
    <div v-if="nodeConfig.type === 'router'" class="branch-wrap">
      <div class="branch-box-wrap">
        <div class="branch-box">
          <button class="add-branch" @click="addTerm">添加条件</button>
          <div v-for="(item, index) in nodeConfig.conditionNodes" :key="index" class="col-box">
            <div class="condition-node">
              <div class="condition-node-box">
                <div class="auto-judge" :class="isTried && item.error ? 'error active' : ''">
                  <div v-if="index !== 0" class="sort-left" @click="arrTransfer(index, -1)">&lt;</div>
                  <div class="title-wrapper">
                    <input v-if="isInputList[index]" v-model="item.nodeName" v-focus class="el-input__inner" @blur="blurEvent(index)" @focus="$event.currentTarget.select()" />
                    <span v-if="!isInputList[index]" class="editable-title" @click="clickEvent(index)">{{ item.nodeName }}</span>
                    <span class="priority-title" @click="setPerson(item.priorityLevel)">优先级{{ item.priorityLevel }}</span>
                    <i class="iconfont el-icon-close" @click="delTerm(index)" />
                  </div>
                  <div v-if="index !== nodeConfig.conditionNodes.length - 1" class="sort-right" @click="arrTransfer(index)">&gt;</div>
                  <div class="content" @click="setPerson(item.priorityLevel)" v-html="conditionStr(item, index)" />
                  <div v-if="isTried && item.error" class="error_tip">
                    <i class="el-icon-warning-outline" style="color: rgb(242, 86, 67)"></i>
                  </div>
                </div>
                <add-node :child-node-p.sync="item.childNode" />
              </div>
            </div>
            <node-wrap v-if="item.childNode && item.childNode" :node-config.sync="item.childNode" :is-tried.sync="isTried" :conditions="conditions" :director-max-level="directorMaxLevel" />
            <div v-if="index === 0" class="top-left-cover-line"></div>
            <div v-if="index === 0" class="bottom-left-cover-line"></div>
            <div v-if="index === nodeConfig.conditionNodes.length - 1" class="top-right-cover-line"></div>
            <div v-if="index === nodeConfig.conditionNodes.length - 1" class="bottom-right-cover-line"></div>
          </div>
        </div>
        <add-node :child-node-p.sync="nodeConfig.childNode" />
      </div>
    </div>
    <el-drawer title="发起人" :visible.sync="promoterDrawer" :wrapper-closable="false" custom-class="set-promoter-drawer" size="550px" append-to-body>
      <div class="demo-drawer__content">
        <div class="promoter_content drawer_content">
          <el-button type="primary" @click="addPromoter">添加/修改发起人</el-button>
          <p v-if="startConfig.nodeUserList && startConfig.nodeUserList.length > 0" class="selected_list">
            <span v-for="(item, index) in startConfig.nodeUserList" :key="index">
              {{ item.label }}
              <span class="el-icon-close" @click="removeEle(startConfig.nodeUserList, index)" />
            </span>
            <a @click="startConfig.nodeUserList = []">清除</a>
          </p>
          <p v-else class="selected_list">所有人</p>
        </div>
        <div class="demo-drawer__footer clearfix">
          <el-button type="primary" @click="savePromoter">确 定</el-button>
          <el-button @click="promoterDrawer = false">取 消</el-button>
        </div>
        <el-dialog title="选择成员" :visible.sync="promoterVisible" width="600px" :close-on-click-modal="false" append-to-body custom-class="set-promoter-dialog">
          <div class="person_body clearfix">
            <div class="person_tree fl">
              <el-input v-model="promoterSearchName" type="text" size="mini" placeholder="搜索成员" @input="(value) => getDebounceData(value, activeName)" />
              <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="人员列表" name="1"></el-tab-pane>
                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                <el-tab-pane label="部门列表" name="3"></el-tab-pane>
              </el-tabs>
              <div class="person_list">
                <el-checkbox-group v-if="activeName === '1'" v-model="promoterUserChecked">
                  <el-checkbox v-for="item in userList" :key="item.value" :label="item.value" @change="toChecked(checkedUserList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-user" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <el-checkbox-group v-if="activeName === '2'" v-model="promoterRoleChecked">
                  <el-checkbox v-for="item in roleList" :key="item.value" :label="item.value" @change="toChecked(checkedRoleList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-folder" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <el-checkbox-group v-if="activeName === '3'" v-model="promoterDeptChecked">
                  <el-checkbox v-for="item in deptList" :key="item.value" :label="item.value" @change="toChecked(checkedDeptList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-folder" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="has_selected fl">
              <p class="clearfix">
                已选（{{ checkedDeptList.length + checkedRoleList.length + checkedUserList.length }}）
                <a @click="emptyPromoter">清空</a>
              </p>
              <ul>
                <li v-for="(item, index) in checkedDeptList" :key="index + 'd'">
                  <span class="icon el-icon-folder" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(checkedDeptList, index)" />
                </li>
                <li v-for="(item, index) in checkedRoleList" :key="index + 'r'">
                  <span class="icon el-icon-folder" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(checkedRoleList, index)" />
                </li>
                <li v-for="(item, index) in checkedUserList" :key="index + 'g'">
                  <span class="icon el-icon-user" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(checkedUserList, index)" />
                </li>
              </ul>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="promoterVisible = false">取 消</el-button>
            <el-button type="primary" @click="surePromoter">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-drawer>
    <el-drawer title="审批人设置" :visible.sync="approverDrawer" :wrapper-closable="false" custom-class="set-promoter-drawer" size="550px" append-to-body>
      <div class="demo-drawer__content">
        <div class="drawer_content">
          <div class="approver_content">
            <el-radio-group v-model="approverConfig.setType" class="clearfix" @change="changeType">
              <el-radio :label="1">指定成员</el-radio>
              <el-radio :label="2">主管</el-radio>
              <el-radio :label="4">发起人自选</el-radio>
              <!-- <el-radio :label="5">发起人自己</el-radio> -->
              <!-- <el-radio :label="7">连续多级主管</el-radio> -->
            </el-radio-group>
          </div>
          <div v-if="approverConfig.setType === 1" class="specify_member">
            <el-button type="primary" @click="addApprover">添加/修改成员</el-button>
            <p v-if="approverConfig.nodeUserList && approverConfig.nodeUserList.length > 0" class="selected_list">
              <span v-for="(item, index) in approverConfig.nodeUserList" :key="index">
                {{ item.label }}
                <span class="el-icon-close" @click="removeEle(approverConfig.nodeUserList, index)" />
              </span>
              <a @click="approverConfig.nodeUserList = []">清除</a>
            </p>
          </div>
          <div v-if="approverConfig.setType === 2" class="approver_manager">
            <p>
              <span>发起人的：</span>
              <el-select v-model="approverConfig.directorLevel" size="small" placeholder="请选择">
                <el-option v-for="item in directorMaxLevel" :key="item" :label="item === 1 ? '直接主管' : `第${item}级主管`" :value="item" />
              </el-select>
            </p>
            <p class="tip">找不到主管时，由上级主管代审批</p>
          </div>
          <div v-if="approverConfig.setType === 4" class="approver_self_select">
            <el-radio-group v-model="approverConfig.selectMode" style="width: 100%" @change="changeModeOrRange">
              <el-radio :label="1">选一个人</el-radio>
              <el-radio :label="2">选多个人</el-radio>
            </el-radio-group>
            <h3>选择范围</h3>
            <el-radio-group v-model="approverConfig.selectRange" style="width: 100%" @change="changeModeOrRange">
              <el-radio :label="1">全公司</el-radio>
              <el-radio :label="2">指定成员</el-radio>
              <!-- <el-radio :label="3">指定角色</el-radio> -->
            </el-radio-group>
            <el-button v-if="approverConfig.selectRange === 2" type="primary" @click="addApprover">添加/修改成员</el-button>
            <el-button v-if="approverConfig.selectRange === 3" type="primary" @click="addRoleApprover">添加/修改角色</el-button>
            <p v-if="approverConfig.selectRange === 2 || approverConfig.selectRange === 3" class="selected_list">
              <span v-for="(item, index) in approverConfig.nodeUserList" :key="index">
                {{ item.label }}
                <span class="el-icon-close" @click="removeEle(approverConfig.nodeUserList, index)" />
              </span>
              <a v-if="approverConfig.nodeUserList.length > 0" @click="approverConfig.nodeUserList = []">清除</a>
            </p>
          </div>
          <!-- <div v-if="approverConfig.setType === 5" class="approver_self">
            <p>该审批节点设置“发起人自己”后，审批人默认为发起人</p>
          </div> -->
          <!-- <div v-if="approverConfig.setType === 7" class="approver_manager">
            <p>审批终点</p>
            <p style="padding-bottom: 20px">
              <span>发起人的：</span>
              <select v-model="approverConfig.examineEndDirectorLevel">
                <option v-for="item in directorMaxLevel" :key="item" :value="item">{{ item === 1 ? '最高' : '第' + item }}层级主管</option>
              </select>
            </p>
          </div> -->
          <div v-if="(approverConfig.setType === 1 && approverConfig.nodeUserList.length > 1) || (approverConfig.setType === 4 && approverConfig.selectMode === 2)" class="approver_some">
            <p>多人审批时采用的审批方式</p>
            <el-radio-group v-model="approverConfig.examineMode" class="clearfix">
              <el-radio :label="1">依次审批</el-radio>
              <el-radio v-if="approverConfig.setType !== 2" :label="2">会签（须所有审批人同意）</el-radio>
              <el-radio v-if="approverConfig.setType !== 2" :label="3">或签（一名审批人同意或拒绝即可）</el-radio>
            </el-radio-group>
          </div>
          <!-- <div v-if="approverConfig.setType === 2 || approverConfig.setType === 7" class="approver_some">
            <p>审批人为空时</p>
            <el-radio-group v-model="approverConfig.noHanderAction" class="clearfix">
              <el-radio :label="1">自动审批通过/不允许发起</el-radio>
              <br />
              <el-radio :label="2">转交给审核管理员</el-radio>
            </el-radio-group>
          </div> -->
        </div>
        <div class="demo-drawer__footer clearfix">
          <el-button type="primary" @click="saveApprover">确 定</el-button>
          <el-button @click="approverDrawer = false">取 消</el-button>
        </div>
        <el-dialog title="选择成员" :visible.sync="approverVisible" width="600px" :close-on-click-modal="false" append-to-body custom-class="set-promoter-dialog">
          <div class="person_body clearfix">
            <div class="person_tree fl">
              <el-input v-model="approverSearchName" type="text" size="mini" placeholder="搜索成员" @input="(value) => getDebounceData(value, activeName)" />
              <div class="person_list">
                <el-checkbox-group v-model="approverUserChecked">
                  <el-checkbox v-for="item in userList" :key="item.value" :label="item.value" @change="toChecked(approverUserList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-user" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="has_selected fl">
              <p class="clearfix">
                已选（{{ approverUserList.length }}）
                <a @click="emptyApprover">清空</a>
              </p>
              <ul>
                <li v-for="(item, index) in approverUserList" :key="index + 'f'">
                  <span class="icon el-icon-user" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(approverUserList, index)" />
                </li>
              </ul>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="approverVisible = false">取 消</el-button>
            <el-button type="primary" @click="sureApprover">确 定</el-button>
          </span>
        </el-dialog>
        <el-dialog title="选择角色" :visible.sync="approverRoleVisible" width="600px" :close-on-click-modal="false" append-to-body custom-class="set-promoter-dialog">
          <div class="person_body clearfix">
            <div class="person_tree fl">
              <el-input v-model="approverSearchName" type="text" size="mini" placeholder="搜索角色" @input="(value) => getDebounceData(value, 2)" />
              <div class="person_list">
                <el-checkbox-group v-model="approverRoleChecked">
                  <el-checkbox v-for="item in roleList" :key="item.value" :label="item.value" @change="toChecked(approverRoleList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-folder" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="has_selected fl">
              <p class="clearfix">
                已选（{{ approverRoleList.length }}）
                <a @click="emptyRole">清空</a>
              </p>
              <ul>
                <li v-for="(item, index) in approverRoleList" :key="index + 'f'">
                  <span class="icon el-icon-folder" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(approverRoleList, index)" />
                </li>
              </ul>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="approverRoleVisible = false">取 消</el-button>
            <el-button type="primary" @click="sureApprover">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-drawer>
    <el-drawer title="抄送人设置" :visible.sync="copyerDrawer" :wrapper-closable="false" custom-class="set-copyer-drawer" size="550px" append-to-body>
      <div class="demo-drawer__content">
        <div class="copyer_content drawer_content">
          <el-button type="primary" @click="addCopyer">添加成员</el-button>
          <p class="selected_list">
            <span v-for="(item, index) in copyerConfig.nodeUserList" :key="index">
              {{ item.label }}
              <span class="el-icon-close" @click="removeEle(copyerConfig.nodeUserList, index)" />
            </span>
            <a v-if="copyerConfig.nodeUserList && copyerConfig.nodeUserList.length > 0" @click="copyerConfig.nodeUserList = []">清除</a>
          </p>
          <el-checkbox-group v-model="ccSelfSelectFlag" class="clearfix">
            <el-checkbox :label="1">允许发起人自选抄送人</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="demo-drawer__footer clearfix">
          <el-button type="primary" @click="saveCopyer">确 定</el-button>
          <el-button @click="copyerDrawer = false">取 消</el-button>
        </div>
        <el-dialog title="选择成员" :visible.sync="copyerVisible" width="600px" :close-on-click-modal="false" append-to-body custom-class="set-promoter-dialog">
          <div class="person_body clearfix">
            <div class="person_tree fl">
              <el-input v-model="copyerSearchName" type="text" size="mini" placeholder="搜索成员" @input="(value) => getDebounceData(value, activeName)" />
              <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="人员列表" name="1"></el-tab-pane>
                <el-tab-pane label="部门列表" name="3"></el-tab-pane>
              </el-tabs>
              <div class="person_list">
                <el-checkbox-group v-if="activeName === '1'" v-model="copyerUserChecked">
                  <el-checkbox v-for="item in userList" :key="item.value" :label="item.value" @change="toChecked(copyerUserList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-user" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <el-checkbox-group v-if="activeName === '3'" v-model="copyerDeptChecked">
                  <el-checkbox v-for="item in deptList" :key="item.value" :label="item.value" @change="toChecked(copyerDeptList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-folder" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="has_selected fl">
              <p class="clearfix">
                已选（{{ copyerUserList.length + copyerDeptList.length }}）
                <a @click="emptyCopyer">清空</a>
              </p>
              <ul>
                <li v-for="(item, index) in copyerUserList" :key="index + 'a'">
                  <span class="icon el-icon-user" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(copyerUserList, index)" />
                </li>
                <li v-for="(item, index) in copyerDeptList" :key="index + 'b'">
                  <span class="icon el-icon-folder" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(copyerDeptList, index)" />
                </li>
              </ul>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="copyerVisible = false">取 消</el-button>
            <el-button type="primary" @click="sureCopyer">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-drawer>
    <el-drawer title="条件设置" :visible.sync="conditionDrawer" :wrapper-closable="false" custom-class="condition-copyer-drawer" size="550px" append-to-body>
      <div class="demo-drawer__content">
        <div class="condition_content drawer_content">
          <el-select v-model="conditionConfig.priorityLevel" size="small" placeholder="请选择">
            <el-option v-for="item in conditionsConfig.conditionNodes.length" :key="item" :label="`优先级${item}`" :value="item" />
          </el-select>

          <div class="condition_content_box">
            <div v-for="(condition, i) in conditionConfig.conditionList" :key="'or' + i" class="condition_content_or_item">
              <div class="condition_content_and">
                <div v-for="(item, j) in condition" :key="'and' + j" class="condition_content_and_item">
                  <el-row :gutter="10">
                    <el-col :span="6">
                      <el-select v-model="item.id" placeholder="请选择" style="width: 100%" @change="(val) => changeConditionType(val, i, j)">
                        <el-option v-for="c in conditions" :key="c.id" :label="c.fieldLabel" :value="c.id" />
                      </el-select>
                    </el-col>
                    <el-col :span="6">
                      <el-select v-model="item.canditionSymbol" placeholder="请选择" style="width: 100%">
                        <el-option v-for="c in item.canditionOptions" :key="c.value" :label="c.label" :value="c.value" />
                      </el-select>
                    </el-col>
                    <el-col :span="10">
                      <div v-if="item.fieldType === 'starterUser'" class="selected_list" @click="addConditionRole(i, j)">
                        <span v-if="item.value && item.value.length > 0" :key="item.value[0].value">
                          <span class="text-name">
                            {{ item.value[0].label }}
                          </span>
                          <span class="el-icon-close" @click.stop="removeEle(item.value, 0)" />
                        </span>
                        <span v-if="item.value && item.value.length > 1">+{{ item.value.length - 1 }}</span>
                        <span v-if="!(item.value && item.value.length > 0)" class="placeholder">请选择具体人员/角色/部门</span>
                      </div>
                      <el-select v-else-if="item.component === 'select'" v-model="item.value" filterable :multiple="item.fieldType === 'array'" collapse-tags placeholder="请选择" style="width: 100%">
                        <el-option v-for="d in item.dictOptions" :key="d.value" :label="d.label" :value="d.value" />
                      </el-select>
                      <el-date-picker v-else-if="item.component === 'picker'" v-model="item.value" type="date" placeholder="选择日期" />
                      <el-input-number v-else-if="item.fieldType === 'number'" v-model="item.value" controls-position="right" style="width: 100%" :min="1" :max="99999999" />
                      <el-input v-else v-model="item.value" placeholder="请输入内容" />
                    </el-col>
                    <el-col :span="2">
                      <a @click="removeConditionEle(condition, i, j)">删除</a>
                    </el-col>
                  </el-row>
                </div>
                <el-button type="text" icon="el-icon-plus" @click="addCondition('and', i)">且条件</el-button>
              </div>
              <div v-if="conditionConfig.conditionList.length - 1 > i" class="or-text">或</div>
            </div>

            <el-button type="text" icon="el-icon-plus" @click="addCondition('or')">或条件</el-button>
          </div>
        </div>
        <div class="demo-drawer__footer clearfix">
          <el-button type="primary" @click="saveCondition">确 定</el-button>
          <el-button @click="conditionDrawer = false">取 消</el-button>
        </div>
        <el-dialog title="选择成员" :visible.sync="conditionRoleVisible" width="600px" :close-on-click-modal="false" append-to-body custom-class="set-promoter-dialog">
          <div class="person_body clearfix">
            <div class="person_tree fl">
              <el-input v-model="conditionRoleSearchName" type="text" size="mini" placeholder="搜索成员" @input="(value) => getDebounceData(value, activeName)" />
              <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="人员列表" name="1"></el-tab-pane>
                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                <el-tab-pane label="部门列表" name="3"></el-tab-pane>
              </el-tabs>
              <div class="person_list">
                <el-checkbox-group v-if="activeName === '1'" v-model="conditionUserChecked">
                  <el-checkbox v-for="item in userList" :key="item.value" :label="item.value" @change="toChecked(conditionUserList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-user" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <el-checkbox-group v-if="activeName === '2'" v-model="conditionRoleChecked">
                  <el-checkbox v-for="item in roleList" :key="item.value" :label="item.value" @change="toChecked(conditionRoleList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-folder" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
                <el-checkbox-group v-if="activeName === '3'" v-model="conditionDeptChecked">
                  <el-checkbox v-for="item in deptList" :key="item.value" :label="item.value" @change="toChecked(conditionDeptList, item, 'value')">
                    <span class="custom-tree-node">
                      <span class="icon el-icon-folder" />
                      {{ item.label }}
                    </span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
            <div class="has_selected fl">
              <p class="clearfix">
                已选（{{ conditionUserList.length + conditionRoleList.length + conditionDeptList.length }}）
                <a @click="emptyCondition">清空</a>
              </p>
              <ul>
                <li v-for="(item, index) in conditionUserList" :key="index + 'd'">
                  <span class="icon el-icon-user" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(conditionUserList, index)" />
                </li>
                <li v-for="(item, index) in conditionRoleList" :key="index + 'e'">
                  <span class="icon el-icon-folder" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(conditionRoleList, index)" />
                </li>
                <li v-for="(item, index) in conditionDeptList" :key="index + 'c'">
                  <span class="icon el-icon-folder" />
                  <span>{{ item.label }}</span>
                  <span class="el-icon-circle-close" @click="removeEle(conditionDeptList, index)" />
                </li>
              </ul>
            </div>
          </div>
          <span slot="footer" class="dialog-footer">
            <el-button @click="conditionRoleVisible = false">取 消</el-button>
            <el-button type="primary" @click="sureConditionRole">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </el-drawer>
    <node-wrap v-if="nodeConfig.childNode && nodeConfig.childNode" :node-config.sync="nodeConfig.childNode" :is-tried.sync="isTried" :conditions="conditions" :director-max-level="directorMaxLevel" />
  </div>
</template>
<script>
import NodeWrap from './node-wrap';
import AddNode from './add-node';
import { debounce } from '../utils/index';
export default {
  name: 'node-wrap',
  components: { NodeWrap, AddNode },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      },
    },
  },
  props: ['nodeConfig', 'conditions', 'directorMaxLevel', 'isTried'],
  inject: ['process'],
  data() {
    return {
      placeholderList: {
        start: '发起人',
        approver: '审核人',
        copy: '抄送人',
      },
      // 是输入框的条件节点数组
      isInputList: [],
      // 是否为输入框
      isInput: false,
      // 组织架构： '1', 角色列表：'2'
      activeName: '1',
      // 用户列表
      userList: [],
      // 部门信息
      deptList: [],
      // 角色列表
      roleList: [],
      // 发起人
      promoterDrawer: false,
      // 发起人 选择成员弹窗
      promoterVisible: false,
      // 发起人设置 Config
      startConfig: {},
      // 发起人设置 选择成员 已选择的部门
      checkedDeptList: [],
      // 发起人设置 选择成员 已选择的角色
      checkedRoleList: [],
      // 发起人设置 选择成员 已选择的人员
      checkedUserList: [],
      // 发起人设置 选择成员 搜索字段
      promoterSearchName: '',
      // 审批人设置
      approverDrawer: false,
      // 审批人设置 选择成员弹窗
      approverVisible: false,
      // 审批人设置 选择角色
      approverRoleVisible: false,
      // 审批人设置 Config
      approverConfig: {},
      // 审批人设置 选择成员 搜索字段
      approverSearchName: '',
      // 审批人设置 选择成员 已选择的成员
      approverUserList: [],
      // 审批人设置 选择角色 已选择的角色
      approverRoleList: [],
      // 抄送人设置
      copyerDrawer: false,
      // 抄送人设置 选择成员弹窗
      copyerVisible: false,
      // 抄送人设置 Config
      copyerConfig: {},
      // 抄送人设置 选择成员 搜索字段
      copyerSearchName: '',
      // 抄送人设置 选择成员 已选择的成员
      copyerUserList: [],
      // 抄送人设置 选择角色 已选择的角色
      copyerDeptList: [],
      // 抄送人设置 允许发起人自选抄送人
      ccSelfSelectFlag: [],
      // 条件设置
      conditionDrawer: false,
      // 条件设置 Config
      conditionConfig: {},
      // 条件设置
      conditionsConfig: {
        conditionNodes: [],
      },
      // 条件设置 旧的的节点
      bPriorityLevel: '',
      // 当前设置条件的位置
      orConditionIndex: 0,
      andConditionIndex: 0,
      // 条件设置 已选择的条件
      conditionList: [[{}]],
      // 条件设置 选择成员弹窗
      conditionRoleVisible: false,
      // 条件设置 选择成员 搜索字段
      conditionRoleSearchName: '',
      // 条件设置 选择成员 已选择的部门
      conditionUserList: [],
      // 条件设置 选择角色 已选择的角色
      conditionRoleList: [],
      // 条件设置 选择部门 已选择的部门
      conditionDeptList: [],
    };
  },
  computed: {
    startTitleStyle() {
      return `background: ${(this.nodeConfig.type === 'start' && '#576A95') || (this.nodeConfig.type === 'approver' && '#FF943E') || (this.nodeConfig.type === 'copy' && '#3296FA')};`;
    },
    promoterUserChecked: {
      get() {
        return this.checkedUserList.map((item) => item.value);
      },
      set() {},
    },
    promoterRoleChecked: {
      get() {
        return this.checkedRoleList.map((item) => item.value);
      },
      set() {},
    },
    promoterDeptChecked: {
      get() {
        return this.checkedDeptList.map((item) => item.value);
      },
      set() {},
    },
    approverUserChecked: {
      get() {
        return this.approverUserList.map((item) => item.value);
      },
      set() {},
    },
    approverRoleChecked: {
      get() {
        return this.approverRoleList.map((item) => item.value);
      },
      set() {},
    },
    copyerUserChecked: {
      get() {
        return this.copyerUserList.map((item) => item.value);
      },
      set() {},
    },
    copyerDeptChecked: {
      get() {
        return this.copyerDeptList.map((item) => item.value);
      },
      set() {},
    },
    conditionUserChecked: {
      get() {
        return this.conditionUserList.map((item) => item.value);
      },
      set() {},
    },
    conditionRoleChecked: {
      get() {
        return this.conditionRoleList.map((item) => item.value);
      },
      set() {},
    },
    conditionDeptChecked: {
      get() {
        return this.conditionDeptList.map((item) => item.value);
      },
      set() {},
    },
  },
  watch: {
    nodeConfig: function () {
      console.log('nodeConfig', this.nodeConfig);
    },
    conditions: function () {
      // console.log('conditions', this.conditions);
    },
  },
  mounted() {
    if (this.nodeConfig.type === 'approver') {
      this.nodeConfig.error = !this.setApproverStr(this.nodeConfig);
    } else if (this.nodeConfig.type === 'copy') {
      this.nodeConfig.error = !this.copyerStr(this.nodeConfig);
    } else if (this.nodeConfig.type === 'router') {
      this.conditionCheck();
    }
  },
  methods: {
    // 点击节点名字 -> 显示可输入
    clickEvent(index) {
      if (index || index === 0) {
        this.$set(this.isInputList, index, true);
      } else if (this.nodeConfig.type !== 'start') {
        this.isInput = true;
      }
    },
    // 光标离开节点名字输入框
    blurEvent(index) {
      if (index || index === 0) {
        this.$set(this.isInputList, index, false);
        this.nodeConfig.conditionNodes[index].nodeName = this.nodeConfig.conditionNodes[index].nodeName ? this.nodeConfig.conditionNodes[index].nodeName : '条件';
      } else {
        this.isInput = false;
        this.nodeConfig.nodeName = this.nodeConfig.nodeName ? this.nodeConfig.nodeName : this.placeholderList[this.nodeConfig.type];
      }
    },
    // 条件校验
    conditionCheck() {
      const conditionNodes = this.nodeConfig.conditionNodes || [];
      for (let i = 0; i < conditionNodes.length; i++) {
        this.nodeConfig.conditionNodes[i].error = this.conditionStr(conditionNodes[i], i) === '请设置条件' && i !== conditionNodes.length - 1;
      }
    },
    // 节点详情格式化
    conditionStr(item, index) {
      const { conditionList } = item;
      if (conditionList.length === 0) {
        const conditionNodes = this.nodeConfig.conditionNodes || [];
        return index === conditionNodes.length - 1 && conditionNodes[0].conditionList.length !== 0 ? '其他条件进入此流程' : '请设置条件';
      } else {
        let str = '';
        for (let i = 0; i < conditionList.length; i++) {
          const conditions = conditionList[i];
          for (let j = 0; j < conditions.length; j++) {
            const { canditionOptions, canditionSymbol, component, dictOptions, fieldLabel, fieldType, value } = conditions[j];
            if (fieldLabel && canditionSymbol && value) {
              const canditionSymbolFd = canditionOptions.find((c) => {
                return c.value === canditionSymbol;
              });
              const canditionSymbolLabel = canditionSymbolFd ? canditionSymbolFd.label : '';
              if (fieldType === 'starterUser' && canditionSymbolLabel && value.length > 0) {
                const valueLabe = value.map((v) => v.label).join('，');
                if (valueLabe && valueLabe.length > 0) {
                  str += `<b>${fieldLabel}</b> ${canditionSymbolLabel} ${valueLabe} <br/>`;
                }
              } else if (component === 'select') {
                if (fieldType === 'array' && value.length > 0) {
                  const fr = dictOptions.filter((v) => {
                    return value.indexOf(v.value) !== -1;
                  });
                  const valueLabe = fr && fr.length > 0 ? fr.map((f) => f.label).join('，') : '';
                  if (valueLabe && valueLabe.length > 0) {
                    str += `<b>${fieldLabel}</b>  ${canditionSymbolLabel} ${valueLabe} <br/>`;
                  }
                } else {
                  const fd = dictOptions.find((v) => value === v.value);
                  const valueLabe = fd ? fd.label : '';
                  if (valueLabe && valueLabe.length > 0) {
                    str += `<b>${fieldLabel}</b>  ${canditionSymbolLabel} ${valueLabe} <br/>`;
                  }
                }
              } else {
                str += `<b>${fieldLabel}</b> ${canditionSymbolLabel} ${value} <br/>`;
              }
            }
          }
          if (conditionList.length - 1 > i) {
            str += `<div class="or-text">或</div>`;
          }
        }
        return str ? `<div class="condition-str">${str.substring(0, str.length - 5)}</div>` : '请设置条件';
      }
    },
    dealStr(str, obj) {
      const arr = [];
      const list = str.split(',');
      for (const elem in obj) {
        list.map((item) => {
          if (item === elem) {
            arr.push(obj[elem].value);
          }
        });
      }
      return arr.join('或');
    },
    // 点击条件判断添加 人员角色
    addConditionRole(i, j) {
      this.conditionRoleSearchName = '';
      this.conditionRoleVisible = true;
      this.activeName = '1';
      this.getUserList();
      this.orConditionIndex = i;
      this.andConditionIndex = j;
      this.conditionUserList = [];
      this.conditionRoleList = [];
      this.conditionDeptList = [];
      const conditionList = this.conditionConfig.conditionList;
      const currentCondition = conditionList && conditionList[i] && conditionList[i][j];
      if (currentCondition && conditionList[i][j].value && conditionList[i][j].value.length > 0) {
        for (let z = 0; z < conditionList[i][j].value.length; z++) {
          const item = conditionList[i][j].value[z];
          if (item.type === 1) {
            this.conditionUserList.push({
              type: 1,
              value: item.value,
              label: item.label,
            });
          } else if (item.type === 2) {
            this.conditionRoleList.push({
              type: 2,
              value: item.value,
              label: item.label,
            });
          } else if (item.type === 3) {
            this.conditionDeptList.push({
              type: 3,
              value: item.value,
              label: item.label,
            });
          }
        }
      } else {
        this.$set(conditionList[i][j], 'value', []);
      }
    },
    removeConditionEle(arr, i, j) {
      arr.splice(j, 1);
      if (arr.length < 1) {
        this.conditionConfig.conditionList.splice(i, 1);
      }
    },
    // 条件判断清空 人员角色
    emptyCondition() {
      this.conditionUserList = [];
      this.conditionRoleList = [];
      this.conditionDeptList = [];
    },
    // 保存条件判断 已选择的人员角色
    sureConditionRole() {
      const conditionList = this.conditionConfig.conditionList;
      this.$set(conditionList[this.orConditionIndex][this.andConditionIndex], 'value', []);
      if (this.conditionDeptList && this.conditionDeptList.length > 0) {
        for (let j = 0; j < this.conditionDeptList.length; j++) {
          const item = this.conditionDeptList[j];
          if (item) {
            conditionList[this.orConditionIndex][this.andConditionIndex].value.push({
              type: 3,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      if (this.conditionRoleList && this.conditionRoleList.length > 0) {
        for (let l = 0; l < this.conditionRoleList.length; l++) {
          const item = this.conditionRoleList[l];
          if (item) {
            conditionList[this.orConditionIndex][this.andConditionIndex].value.push({
              type: 2,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      if (this.conditionUserList && this.conditionUserList.length > 0) {
        for (let k = 0; k < this.conditionUserList.length; k++) {
          const item = this.conditionUserList[k];
          if (item) {
            conditionList[this.orConditionIndex][this.andConditionIndex].value.push({
              type: 1,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      this.conditionRoleVisible = false;
    },
    // 条件判断 修改请假类型
    handleLeaveTypeChange() {},
    // 点击条件设置中的添加条件
    addCondition(type, index) {
      if (type === 'and') {
        if (this.conditionConfig.conditionList[index] && this.conditionConfig.conditionList[index].length > 0) {
          this.conditionConfig.conditionList[index].push({});
        } else {
          this.conditionConfig.conditionList[index] = [{}];
        }
      } else if (type === 'or') {
        this.conditionConfig.conditionList.push([{}]);
      }
    },
    // 修改条件类型
    changeConditionType(val, i, j) {
      const fd = this.conditions.find((c) => c.id === val);
      const condition = fd ? JSON.parse(JSON.stringify(fd)) : {};
      if (this.conditionConfig.conditionList[i] && this.conditionConfig.conditionList[i].length > 0) {
        this.conditionConfig.conditionList[i].splice(j, 1, condition);
      } else {
        this.conditionConfig.conditionList[i] = [{}];
      }
    },
    // 条件设置 选择比较条件
    changeOptType() {},
    // 保存条件设置
    saveCondition() {
      this.conditionDrawer = false;
      const a = this.conditionsConfig.conditionNodes.splice(this.bPriorityLevel - 1, 1); // 截取旧下标
      this.conditionsConfig.conditionNodes.splice(this.conditionConfig.priorityLevel - 1, 0, a[0]); // 填充新下标
      this.conditionsConfig.conditionNodes.map((item, index) => {
        item.priorityLevel = index + 1;
      });
      for (let i = 0; i < this.conditionsConfig.conditionNodes.length; i++) {
        const conditionNodes = this.conditionsConfig.conditionNodes[i].conditionList.filter((cn) => {
          const fr = cn.filter((c) => c.fieldLabel && c.canditionSymbol && c.value);
          return fr && fr.length > 0;
        });
        this.$set(this.conditionsConfig.conditionNodes[i], 'conditionList', conditionNodes);
        this.conditionsConfig.conditionNodes[i].error = this.conditionStr(this.conditionsConfig.conditionNodes[i], i) === '请设置条件' && i !== this.conditionsConfig.conditionNodes.length - 1;
      }
      this.$emit('update:nodeConfig', this.conditionsConfig);
    },
    // 选择人员角色 输入框搜索
    getDebounceData(value = null, type = 1) {
      const asynFu = function () {
        console.log('123', value);
        if (type - 1 === 0) {
          this.getUserList({ nickName: value });
        } else if (type - 2 === 0) {
          this.getRoleList({ name: value });
        } else {
          this.getDeptList({ name: value });
        }
      };

      debounce(3000, asynFu).call(this);
    },
    // 切换 组织架构 <-> 角色列表 页签
    handleClick() {
      this.promoterSearchName = '';
      this.copyerSearchName = '';
      this.conditionRoleSearchName = '';
      if (this.activeName - 1 === 0) {
        this.getUserList();
      } else if (this.activeName - 2 === 0) {
        this.getRoleList();
      } else {
        this.getDeptList();
      }
    },
    // 抄送人设置 点击添加成员
    addCopyer() {
      this.copyerSearchName = '';
      this.copyerVisible = true;
      this.activeName = '1';
      this.getUserList();
      this.copyerUserList = [];
      this.copyerDeptList = [];
      for (let i = 0; i < this.copyerConfig.nodeUserList.length; i++) {
        const item = this.copyerConfig.nodeUserList[i];
        if (item.type === 1) {
          this.copyerUserList.push({
            type: 1,
            value: item.value,
            label: item.label,
          });
        } else if (item.type === 3) {
          this.copyerDeptList.push({
            type: 3,
            value: item.value,
            label: item.label,
          });
        }
      }
    },
    // 抄送人设置 清空人员角色
    emptyCopyer() {
      this.copyerUserList = [];
      this.copyerDeptList = [];
    },
    // 抄送人设置 确定添加成员
    sureCopyer() {
      this.copyerConfig.nodeUserList = [];
      if (this.copyerUserList && this.copyerUserList.length > 0) {
        for (let i = 0; i < this.copyerUserList.length; i++) {
          const item = this.copyerUserList[i];
          if (item) {
            this.copyerConfig.nodeUserList.push({
              type: 1,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      if (this.copyerDeptList && this.copyerDeptList.length > 0) {
        for (let j = 0; j < this.copyerDeptList.length; j++) {
          const item = this.copyerDeptList[j];
          if (item) {
            this.copyerConfig.nodeUserList.push({
              type: 3,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      this.copyerVisible = false;
    },
    // 保存抄送人设置
    saveCopyer() {
      this.copyerConfig.ccSelfSelectFlag = this.ccSelfSelectFlag.length === 0 ? 0 : 1;
      this.copyerConfig.error = !this.copyerStr(this.copyerConfig);
      this.$emit('update:nodeConfig', this.copyerConfig);
      this.copyerDrawer = false;
    },
    copyerStr(nodeConfig) {
      if (nodeConfig.nodeUserList.length !== 0) {
        return this.arrToStr(nodeConfig.nodeUserList);
      } else {
        if (nodeConfig.ccSelfSelectFlag === 1) {
          return '发起人自选';
        }
      }
    },
    // 审批人设置 选择一个或多个or选择范围 清空已选择的人员角色
    changeModeOrRange() {
      this.approverConfig.nodeUserList = [];
    },
    // 审批人设置 选择审批人类型
    changeType(val) {
      this.approverConfig.nodeUserList = [];
      this.approverConfig.examineMode = 3;
      // this.approverConfig.noHanderAction = 2;
      switch (val) {
        case 1:
          break;
        case 2:
          this.approverConfig.directorLevel = 1;
          break;
        case 4:
          this.approverConfig.selectMode = 1;
          this.approverConfig.selectRange = 1;
          break;
        case 7:
          this.approverConfig.examineEndDirectorLevel = 1;
          break;
        default:
          break;
      }
    },
    // 审批人设置 点击添加/修改成员
    addApprover() {
      this.approverVisible = true;
      this.approverSearchName = '';
      this.getUserList();
      this.approverUserList = [];
      if (this.approverConfig.nodeUserList && this.approverConfig.nodeUserList.length > 0) {
        for (let i = 0; i < this.approverConfig.nodeUserList.length; i++) {
          const { label, value } = this.approverConfig.nodeUserList[i];
          this.approverUserList.push({ type: 1, value, label });
        }
      }
    },
    // 审批人设置 点击添加/修改角色
    addRoleApprover() {
      this.approverRoleVisible = true;
      this.approverSearchName = '';
      this.getRoleList();
      this.approverRoleList = [];
      if (this.approverConfig.nodeUserList && this.approverConfig.nodeUserList.length > 0) {
        for (let i = 0; i < this.approverConfig.nodeUserList.length; i++) {
          const { label, value } = this.approverConfig.nodeUserList[i];
          this.approverRoleList.push({ type: 2, value, label });
        }
      }
    },
    // 审批人设置 清空角色
    emptyRole() {
      this.approverRoleList = [];
    },
    // 审批人设置 清空人员
    emptyApprover() {
      this.approverUserList = [];
    },
    // 审批人设置 确认添加/修改角色
    sureApprover() {
      this.approverConfig.nodeUserList = [];
      if (this.approverConfig.setType === 1 || (this.approverConfig.setType === 4 && this.approverConfig.selectRange === 2)) {
        if (this.approverUserList && this.approverUserList.length > 0) {
          for (let i = 0; i < this.approverUserList.length; i++) {
            const item = this.approverUserList[i];
            if (item) {
              this.approverConfig.nodeUserList.push({
                type: 1,
                value: item.value,
                label: item.label,
              });
            }
          }
        }
        this.approverVisible = false;
      } else if (this.approverConfig.setType === 4 && this.approverConfig.selectRange === 3) {
        if (this.approverRoleList && this.approverRoleList.length > 0) {
          for (let j = 0; j < this.approverRoleList.length; j++) {
            const item = this.approverRoleList[j];
            if (item) {
              this.approverConfig.nodeUserList.push({
                type: 2,
                value: item.value,
                label: item.label,
              });
            }
          }
        }
        this.approverRoleVisible = false;
      }
    },
    // 发起人节点 内容格式化
    setApproverStr(nodeConfig) {
      if (nodeConfig.setType === 1) {
        if (nodeConfig.nodeUserList.length === 1) {
          return this.arrToStr(nodeConfig.nodeUserList);
        } else if (nodeConfig.nodeUserList.length > 1) {
          if (nodeConfig.examineMode === 1) {
            return this.arrToStr(nodeConfig.nodeUserList) + '依次审批';
          } else if (nodeConfig.examineMode === 2) {
            return nodeConfig.nodeUserList.length + '人会签';
          } else if (nodeConfig.examineMode === 3) {
            return nodeConfig.nodeUserList.length + '人或签';
          }
        }
      } else if (nodeConfig.setType === 2) {
        const level = nodeConfig.directorLevel === 1 ? '直接主管' : '第' + nodeConfig.directorLevel + '级主管';
        if (nodeConfig.examineMode === 1) {
          return level + '依次审批';
        } else if (nodeConfig.examineMode === 2) {
          return level + '会签';
        } else if (nodeConfig.examineMode === 3) {
          return level + '或签';
        }
      } else if (nodeConfig.setType === 4) {
        if (nodeConfig.selectRange === 1) {
          return '发起人自选';
        } else {
          if (nodeConfig.nodeUserList.length > 0) {
            return '发起人从' + this.arrToStr(nodeConfig.nodeUserList) + '中自选';
          } else {
            return '';
          }
        }
      } else if (nodeConfig.setType === 5) {
        return '发起人自己';
      } else if (nodeConfig.setType === 7) {
        return '从直接主管到通讯录中级别最高的第' + nodeConfig.examineEndDirectorLevel + '个层级主管';
      }
    },
    // 保存审批人设置
    saveApprover() {
      this.approverConfig.error = !this.setApproverStr(this.approverConfig);
      this.$emit('update:nodeConfig', this.approverConfig);
      this.approverDrawer = false;
    },
    // 点击添加发起人
    addPromoter() {
      this.promoterVisible = true;
      this.activeName = '1';
      this.getUserList();
      this.promoterSearchName = '';
      this.checkedUserList = [];
      this.checkedRoleList = [];
      this.checkedDeptList = [];
      if (this.startConfig.nodeUserList && this.startConfig.nodeUserList.length > 0) {
        for (let i = 0; i < this.startConfig.nodeUserList.length; i++) {
          const item = this.startConfig.nodeUserList[i];
          if (item.type === 1) {
            this.checkedUserList.push({
              type: 1,
              value: item.value,
              label: item.label,
            });
          } else if (item.type === 2) {
            this.checkedRoleList.push({
              type: 2,
              value: item.value,
              label: item.label,
            });
          } else if (item.type === 3) {
            this.checkedDeptList.push({
              type: 3,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
    },
    // 发起人人设置 清空人员角色
    emptyPromoter() {
      this.checkedUserList = [];
      this.checkedRoleList = [];
      this.checkedDeptList = [];
    },
    // 确认选择发起人
    surePromoter() {
      this.startConfig.nodeUserList = [];
      if (this.checkedDeptList && this.checkedDeptList.length > 0) {
        for (let i = 0; i < this.checkedDeptList.length; i++) {
          const item = this.checkedDeptList[i];
          if (item) {
            this.startConfig.nodeUserList.push({
              type: 3,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      if (this.checkedRoleList && this.checkedRoleList.length > 0) {
        for (let k = 0; k < this.checkedRoleList.length; k++) {
          const item = this.checkedRoleList[k];
          if (item) {
            this.startConfig.nodeUserList.push({
              type: 2,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      if (this.checkedUserList && this.checkedUserList.length > 0) {
        for (let j = 0; j < this.checkedUserList.length; j++) {
          const item = this.checkedUserList[j];
          if (item) {
            this.startConfig.nodeUserList.push({
              type: 1,
              value: item.value,
              label: item.label,
            });
          }
        }
      }
      this.promoterVisible = false;
    },
    // 保存发起人设置
    savePromoter() {
      this.$emit('update:nodeConfig', this.startConfig);
      this.promoterDrawer = false;
    },
    startStr(nodeConfig) {
      if (nodeConfig.nodeUserList.length !== 0) {
        return this.arrToStr(nodeConfig.nodeUserList);
      } else {
        return '所有人';
      }
    },
    // 发起人数组转字符串
    arrToStr(arr) {
      if (arr) {
        return arr.map((item) => item.label).toString();
      }
    },
    // 选择人员角色 单选or多选
    toCheckedOneOrMultiple(arr, elem, key = 'value') {
      const index = arr.findIndex((v) => v[key] === elem[key]);
      if (this.approverConfig.selectMode === 1) {
        arr.splice(0);
        if (index < 0) {
          arr.push(elem);
        }
      } else {
        index < 0 ? arr.push(elem) : arr.splice(index, 1);
      }
    },
    // 选择人员角色 多选
    toChecked(arr, elem, key = 'value') {
      const index = arr.findIndex((v) => v[key] === elem[key]);
      index < 0 ? arr.push(elem) : arr.splice(index, 1);
    },
    // 取消选择人员角色
    removeEle(arr, index) {
      arr.splice(index, 1);
    },
    // 获取用户列表
    getUserList(params) {
      this.process.$emit('fetchUserList', params, (data) => {
        this.userList = data || [];
      });
    },
    // 获取角色列表
    getRoleList(params) {
      this.process.$emit('fetchRoleList', params, (data) => {
        this.roleList = data || [];
      });
    },
    // 获取部门人员列表
    getDeptList(params) {
      this.process.$emit('fetchDeptList', params, (data) => {
        this.deptList = data || [];
      });
    },
    // 删除节点
    delNode() {
      this.$emit('update:nodeConfig', this.nodeConfig.childNode);
    },
    // 添加条件
    addTerm() {
      const len = this.nodeConfig.conditionNodes.length + 1;
      this.nodeConfig.conditionNodes.push({
        nodeName: '条件' + len,
        type: 'condition',
        priorityLevel: len,
        conditionList: [[{}]],
        childNode: null,
      });
      this.conditionCheck();
      this.$emit('update:nodeConfig', this.nodeConfig);
    },
    // 删除条件
    delTerm(index) {
      this.nodeConfig.conditionNodes.splice(index, 1);
      this.conditionCheck();
      this.$emit('update:nodeConfig', this.nodeConfig);
      if (this.nodeConfig.conditionNodes.length === 1) {
        if (this.nodeConfig.childNode) {
          if (this.nodeConfig.conditionNodes[0].childNode) {
            this.reData(this.nodeConfig.conditionNodes[0].childNode, this.nodeConfig.childNode);
          } else {
            this.nodeConfig.conditionNodes[0].childNode = this.nodeConfig.childNode;
          }
        }
        this.$emit('update:nodeConfig', this.nodeConfig.conditionNodes[0].childNode);
      }
    },
    reData(data, addData) {
      if (!data.childNode) {
        data.childNode = addData;
      } else {
        this.reData(data.childNode, addData);
      }
    },
    // 点击设置节点详情
    setPerson(priorityLevel) {
      const { type } = this.nodeConfig;
      if (type === 'start') {
        this.promoterDrawer = true;
        this.startConfig = JSON.parse(JSON.stringify(this.nodeConfig));
      } else if (type === 'approver') {
        this.approverDrawer = true;
        this.approverConfig = JSON.parse(JSON.stringify(this.nodeConfig));
        this.approverConfig.setType = this.approverConfig.setType ? this.approverConfig.setType : 1;
      } else if (type === 'copy') {
        this.copyerDrawer = true;
        this.copyerConfig = JSON.parse(JSON.stringify(this.nodeConfig));
        this.ccSelfSelectFlag = this.copyerConfig.ccSelfSelectFlag === 0 ? [] : [this.copyerConfig.ccSelfSelectFlag];
      } else {
        this.conditionDrawer = true;
        this.bPriorityLevel = priorityLevel;
        this.conditionsConfig = JSON.parse(JSON.stringify(this.nodeConfig));
        this.conditionConfig = this.conditionsConfig.conditionNodes[priorityLevel - 1];
      }
    },
    // 左右切换条件
    arrTransfer(index, type = 1) {
      // 向左-1,向右1
      this.nodeConfig.conditionNodes[index] = this.nodeConfig.conditionNodes.splice(index + type, 1, this.nodeConfig.conditionNodes[index])[0];
      this.nodeConfig.conditionNodes.map((item, index) => {
        item.priorityLevel = index + 1;
      });
      this.conditionCheck();
      this.$emit('update:nodeConfig', this.nodeConfig);
    },
  },
};
</script>
<style lang="scss">
.node-wrap {
  display: inline-flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 50px;
  position: relative;
  .node-wrap-box {
    display: inline-flex;
    flex-direction: column;
    position: relative;
    width: 220px;
    min-height: 72px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 4px;
    cursor: pointer;
    &:not(.start-node) {
      &:before {
        content: '';
        position: absolute;
        top: -13px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 4px;
        border-style: solid;
        border-width: 8px 6px 4px;
        border-color: #cacaca transparent transparent;
        background: #f5f5f7;
      }
    }
    .start-title {
      position: relative;
      display: flex;
      align-items: center;
      padding-left: 16px;
      padding-right: 30px;
      width: 100%;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      color: #fff;
      text-align: left;
      background: #576a95;
      border-radius: 4px 4px 0 0;
      .editable-title {
        line-height: 15px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        border-bottom: 1px dashed transparent;
      }
      .el-input__inner {
        height: 18px;
        padding-left: 4px;
        text-indent: 0;
        font-size: 12px;
        line-height: 16px;
      }
      .iconfont {
        margin-right: 5px;
      }
      .el-icon-close {
        display: none;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        font-size: 12px;
        color: #fff;
        border-radius: 50%;
        text-align: center;
        line-height: 20px;
      }
    }
    .content {
      position: relative;
      font-size: 13px;
      padding: 16px;
      padding-right: 30px;
      color: #191f25;
      .text {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
      .iconfont {
        display: inline-block;
        font-style: normal;
        vertical-align: baseline;
        text-align: center;
        text-transform: none;
        line-height: 1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        &.arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 14px;
          font-size: 14px;
          color: #979797;
        }
      }
    }
    .error_tip {
      position: absolute;
      top: 0px;
      right: 0px;
      transform: translate(150%, 0px);
      font-size: 24px;
    }
    &.start-node {
      .content {
        .text {
          display: block;
          white-space: nowrap;
        }
      }
    }
    &:hover {
      .editable-title:not(.start) {
        border-bottom: 1px dashed #fff;
      }
      .start-title {
        .el-icon-close {
          display: block;
        }
      }
    }
    &.error {
      border: 1px solid #f25643;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
    }
  }
}
.branch-wrap {
  display: inline-flex;
  width: 100%;
  .branch-box-wrap {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    min-height: 270px;
    width: 100%;
    flex-shrink: 0;
    .branch-box {
      display: flex;
      overflow: visible;
      min-height: 180px;
      height: auto;
      border-bottom: 2px solid #ccc;
      border-top: 2px solid #ccc;
      position: relative;
      margin-top: 15px;
      .add-branch {
        border: none;
        outline: none;
        user-select: none;
        font-size: 12px;
        padding: 0 10px;
        height: 30px;
        line-height: 30px;
        border-radius: 15px;
        color: #3296fa;
        background: #fff;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
        position: absolute;
        top: -16px;
        left: 50%;
        transform: translateX(-50%);
        transform-origin: center center;
        cursor: pointer;
        z-index: 1;
        display: inline-flex;
        align-items: center;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        :hover {
          transform: translateX(-50%) scale(1.1);
          box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
        }
      }
      .col-box {
        background: #f5f5f7;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          margin: auto;
          width: 2px;
          height: 100%;
          background-color: #cacaca;
        }
        .condition-node {
          min-height: 220px;
          display: inline-flex;
          flex-direction: column;
          .condition-node-box {
            min-height: 220px;
            display: inline-flex;
            flex-direction: column;
            padding-top: 30px;
            padding-right: 50px;
            padding-left: 50px;
            justify-content: center;
            align-items: center;
            flex-grow: 1;
            position: relative;
            &:before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              margin: auto;
              width: 2px;
              height: 100%;
              background-color: #cacaca;
            }
            .auto-judge {
              position: relative;
              width: 220px;
              min-height: 72px;
              background: #fff;
              border-radius: 4px;
              padding: 14px 19px;
              cursor: pointer;
              .sort-left {
                position: absolute;
                top: 0;
                bottom: 0;
                display: none;
                z-index: 1;
                left: 0;
                border-right: 1px solid #f6f6f6;
                &:hover {
                  background: #efefef;
                }
              }
              .title-wrapper {
                position: relative;
                font-size: 12px;
                color: #15bc83;
                text-align: left;
                line-height: 16px;
                .editable-title {
                  display: inline-block;
                  max-width: 120px;
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  &:before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 40px;
                  }
                }
                .el-input__inner {
                  height: 18px;
                  padding-left: 4px;
                  text-indent: 0;
                  font-size: 12px;
                  max-width: 120px;
                  line-height: 16px;
                }
                .priority-title {
                  margin-right: 10px;
                  float: right;
                  color: rgba(25, 31, 37, 0.56);
                }
                .el-icon-close {
                  display: none;
                  position: absolute;
                  right: -10px;
                  top: -10px;
                  width: 20px;
                  height: 20px;
                  font-size: 14px;
                  color: rgba(0, 0, 0, 0.25);
                  border-radius: 50%;
                  text-align: center;
                  line-height: 20px;
                  z-index: 2;
                }
              }
              .sort-right {
                position: absolute;
                top: 0;
                bottom: 0;
                display: none;
                z-index: 1;
                right: 0;
                border-left: 1px solid #f6f6f6;
                &:hover {
                  background: #efefef;
                }
              }
              .content {
                font-size: 13px;
                color: #191f25;
                text-align: left;
                margin-top: 6px;
                overflow: hidden;
                text-overflow: ellipsis;
                .condition-str {
                  background: rgba(43, 52, 65, 0.05);
                  line-height: 22px;
                  padding: 8px;
                  .or-text {
                    padding: 0 10px;
                    background-color: #fff;
                    margin: 6px -6px;
                  }
                }
              }
              .error_tip {
                position: absolute;
                top: 0px;
                right: 0px;
                transform: translate(150%, 0px);
                font-size: 24px;
              }
              &.active:after {
                border: 1px solid #3296fa;
                box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);
              }
              &:after {
                pointer-events: none;
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2;
                border-radius: 4px;
                border: 1px solid transparent;
                transition: all 0.1s cubic-bezier(0.645, 0.045, 0.355, 1);
                box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
              }
              &:hover {
                .sort-left,
                .sort-right {
                  display: flex;
                  align-items: center;
                }
                .editable-title {
                  border-bottom: 1px dashed #fff;
                  border-color: #15bc83;
                }
                .el-icon-close {
                  display: block;
                }
                &:after {
                  border: 1px solid #3296fa;
                  box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);
                }
              }
              &.error:after {
                border: 1px solid #f25643;
                box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
              }
            }
          }
        }
        .top-left-cover-line,
        .top-right-cover-line {
          position: absolute;
          height: 3px;
          width: 50%;
          background-color: #f5f5f7;
          top: -3px;
        }
        .top-left-cover-line {
          left: -1px;
        }
        .top-right-cover-line {
          right: -1px;
        }
        .bottom-left-cover-line,
        .bottom-right-cover-line {
          position: absolute;
          height: 3px;
          width: 50%;
          background-color: #f5f5f7;
          bottom: -3px;
        }
        .bottom-left-cover-line {
          left: -1px;
        }
        .bottom-right-cover-line {
          right: -1px;
        }
      }
    }
  }
}

.set-promoter-drawer,
.set-copyer-drawer,
.condition-copyer-drawer {
  position: absolute;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  .el-drawer__header {
    display: flex;
    align-items: center;
    margin-bottom: 0;
    padding: 14px 20px;
    color: #323232;
    font-size: 16px;
    border-bottom: 1px solid #f2f2f2;
    :first-child {
      flex: 1;
      &:focus {
        outline: none;
      }
    }
    .el-drawer__close-btn {
      &:focus {
        outline: none;
      }
    }
  }
  .el-drawer__body {
    flex: 1;
    .demo-drawer__content {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 52px);
      .drawer_content {
        flex: 1;
        padding: 0 20px;
        overflow-y: auto;
        .approver_content {
          padding: 20px 20px 0;
          border-bottom: 1px solid #f2f2f2;
          .el-radio-group {
            width: 100%;
            .el-radio {
              width: 27%;
              margin-bottom: 20px;
            }
          }
        }
        .specify_member {
          padding: 20px 20px 0;
          .el-button {
            margin-bottom: 12px;
          }
          .selected_list {
            margin: 0;
            margin-bottom: 10px;
            line-height: 26px;
            display: flex;
            flex-wrap: wrap;
            > span {
              margin-right: 10px;
              margin-bottom: 10px;
              padding: 4px 6px 4px 9px;
              line-height: 16px;
              white-space: nowrap;
              border-radius: 2px;
              font-size: 14px;
              color: #606266;
              border: 1px solid #dcdcdc;
              background-color: #f4f4f5;
              .el-icon-close {
                line-height: 16px;
                color: #c0c4cc;
                cursor: pointer;
                &:hover {
                  color: #909399;
                }
              }
            }
            a {
              font-size: 14px;
              text-decoration: none;
              cursor: pointer;
              color: #3296fa;
            }
          }
        }
        .approver_manager {
          padding: 20px 20px 0;
          p {
            margin: 0;
            line-height: 32px;
            &:first-of-type {
              line-height: 19px;
              font-size: 14px;
              margin-bottom: 14px;
            }
            &.tip {
              margin: 10px 0 22px 0;
              font-size: 12px;
              line-height: 16px;
              color: #f8642d;
            }
          }
        }
        .approver_self {
          padding: 20px 20px 0;
          p {
            margin: 0;
            line-height: 32px;
          }
        }
        .approver_self_select {
          padding: 20px 20px 0;
          .el-radio-group {
            width: 100%;
            .el-radio {
              width: 27%;
              margin-bottom: 20px;
            }
          }
          h3 {
            margin: 5px 0 20px;
            font-size: 15px;
            font-weight: 500;
            line-height: 19px;
          }
          .el-button {
            margin-bottom: 12px;
          }
          .selected_list {
            margin: 0;
            margin-bottom: 10px;
            line-height: 26px;
            display: flex;
            flex-wrap: wrap;
            > span {
              margin-right: 10px;
              margin-bottom: 10px;
              padding: 4px 6px 4px 9px;
              line-height: 16px;
              white-space: nowrap;
              border-radius: 2px;
              font-size: 14px;
              color: #606266;
              border: 1px solid #dcdcdc;
              background-color: #f4f4f5;
              .el-icon-close {
                line-height: 16px;
                color: #c0c4cc;
                cursor: pointer;
                &:hover {
                  color: #909399;
                }
              }
            }
            a {
              font-size: 14px;
              text-decoration: none;
              cursor: pointer;
              color: #3296fa;
            }
          }
        }
        .approver_some {
          padding: 20px 20px 0;
          p {
            margin: 0;
            line-height: 19px;
            font-size: 14px;
            margin-bottom: 14px;
          }
          .el-radio-group {
            width: 100%;
            .el-radio {
              width: 100%;
              margin: 0px;
              margin-bottom: 10px;
            }
          }
        }
        &.promoter_content {
          padding: 20px 20px 0;
          .el-button {
            margin-bottom: 12px;
          }
          .selected_list {
            margin: 0;
            margin-bottom: 10px;
            line-height: 26px;
            display: flex;
            flex-wrap: wrap;
            > span {
              margin-right: 10px;
              margin-bottom: 10px;
              padding: 4px 6px 4px 9px;
              line-height: 16px;
              white-space: nowrap;
              border-radius: 2px;
              font-size: 14px;
              color: #606266;
              border: 1px solid #dcdcdc;
              background-color: #f4f4f5;
              .el-icon-close {
                line-height: 16px;
                color: #c0c4cc;
                cursor: pointer;
                &:hover {
                  color: #909399;
                }
              }
            }
            a {
              font-size: 14px;
              text-decoration: none;
              cursor: pointer;
              color: #3296fa;
            }
          }
        }
        &.copyer_content {
          padding: 20px 20px 0;
          .el-button {
            margin-bottom: 12px;
          }
          .selected_list {
            margin: 0;
            margin-bottom: 10px;
            line-height: 26px;
            display: flex;
            flex-wrap: wrap;
            > span {
              margin-right: 10px;
              margin-bottom: 10px;
              padding: 4px 6px 4px 9px;
              line-height: 16px;
              white-space: nowrap;
              border-radius: 2px;
              font-size: 14px;
              color: #606266;
              border: 1px solid #dcdcdc;
              background-color: #f4f4f5;
              .el-icon-close {
                line-height: 16px;
                color: #c0c4cc;
                cursor: pointer;
                &:hover {
                  color: #909399;
                }
              }
            }
            a {
              font-size: 14px;
              text-decoration: none;
              cursor: pointer;
              color: #3296fa;
            }
          }
          .el-checkbox-group {
            .el-checkbox {
              margin-bottom: 20px;
            }
          }
        }
        &.condition_content {
          padding: 20px;
          .condition_content_box {
            margin-top: 10px;
            .condition_content_or_item {
              .condition_content_and {
                margin: 0 -20px;
                background: rgba(43, 52, 65, 0.05);
                padding: 10px 20px;
                .condition_content_and_item {
                  .el-col {
                    margin-bottom: 10px;
                    .selected_list {
                      flex: 1;
                      margin: 0;
                      margin-right: 8px;
                      line-height: 26px;
                      border-radius: 4px;
                      border: 1px solid #dcdcdc;
                      background-color: #fff;
                      display: flex;
                      flex-wrap: wrap;
                      > span:not(.placeholder) {
                        margin: 3px;
                        padding: 4px 6px 4px 9px;
                        line-height: 16px;
                        white-space: nowrap;
                        border-radius: 2px;
                        font-size: 14px;
                        color: #606266;
                        border: 1px solid #dcdcdc;
                        background-color: #f4f4f5;
                        .text-name {
                          display: inline-block;
                          vertical-align: middle;
                          max-width: 160px;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          white-space: nowrap;
                          margin-right: 4px;
                        }
                        .el-icon-close {
                          display: inline-block;
                          vertical-align: middle;
                          line-height: 16px;
                          color: #c0c4cc;
                          cursor: pointer;
                          &:hover {
                            color: #909399;
                          }
                        }
                      }
                      .placeholder {
                        line-height: 30px;
                        margin-left: 8px;
                        font-size: 13px;
                        color: #909399;
                      }
                      &:hover {
                        border-color: #c0c4cc;
                        cursor: pointer;
                      }
                    }
                    a {
                      font-size: 14px;
                      text-decoration: none;
                      cursor: pointer;
                      color: #3296fa;
                    }
                  }
                }
              }
              .or-text {
                padding: 10px;
                margin: 0 -20px;
                background-color: #fff;
              }
            }
          }
        }
      }
      .demo-drawer__footer {
        padding: 10px;
        border-top: 1px solid #f2f2f2;
        .el-button {
          float: right;
          margin-right: 10px;
        }
      }
    }
  }
}

.set-promoter-dialog,
.condition-list-dialog {
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
    padding: 10px 20px 14px 20px;
    overflow-x: auto;
    .person_body {
      border: 1px solid #f5f5f5;
      height: 500px;
      min-width: 560px;
      .person_tree {
        padding: 10px 12px 0 8px;
        width: 49%;
        min-width: 280px;
        height: 100%;
        border-right: 1px solid #f5f5f5;
        .el-input {
          width: 80%;
          margin-bottom: 6px;
        }
        .person_list {
          height: 400px;
          overflow-y: auto;
          .el-checkbox-group {
            .el-checkbox {
              width: 100%;
              margin: 0;
              display: flex;
              align-items: center;
              .custom-tree-node {
                line-height: 24px;
                display: flex;
                align-items: center;
              }
            }
            .custom-tree-node {
              color: #333;
              .icon {
                width: 16px;
                height: 16px;
                margin-right: 4px;
              }
            }
          }
          .custom-tree-node {
            color: #333;
            .icon {
              width: 16px;
              height: 16px;
            }
          }
        }
      }
      .has_selected {
        width: 49%;
        min-width: 278px;
        height: 100%;
        font-size: 12px;
        p {
          margin: 0;
          padding-left: 19px;
          padding-right: 20px;
          line-height: 37px;
          border-bottom: 1px solid #f2f2f2;
          a {
            cursor: pointer;
            color: #3296fa;
            float: right;
          }
        }
        ul {
          margin: 0;
          padding: 0;
          height: 460px;
          overflow-y: auto;
          list-style-type: none;
          li {
            font-size: 14px;
            padding: 6px 20px;
            line-height: 16px;
            .icon {
              width: 16px;
              height: 16px;
              margin-right: 5px;
              vertical-align: middle;
            }
            span {
              vertical-align: middle;
              &.el-icon-circle-close {
                float: right;
                cursor: pointer;
              }
            }
            &:hover {
              background-color: #ecf5ff;
            }
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
