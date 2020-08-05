<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="选择店铺">
              <a-select placeholder="请选择店铺" v-model="queryParam.shopId" @change="onChangeShop" @popupScroll="scrollShopLoading">
                <a-select-option value="" disabled>请选择店铺</a-select-option>
                <a-select-option :value="v.id" v-for="(v,i) of shopList" :key="i">{{v.shopName}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="会员等级名称">
              <a-input v-model="queryParam.membershipName" placeholder="请输入会员等级名称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">

            <a-col :md="8" :sm="24">
              <a-form-item label="创建时间">
                <a-range-picker v-model="dateTime" :allowClear="false" @change="onChangeDateTime" />
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryOrder">查询</a-button>
              <a-button style="margin-left: 8px" @click="resetQueryParam">重置</a-button>
              <a @click="toggleAdvanced" style="margin-left: 8px">
                {{ advanced ? '收起' : '展开' }}
                <a-icon :type="advanced ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!--功能按钮-->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleMemberLvRule('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="handleMemberLvRule('edit')">编辑</a-button>
      <!-- <a-button type="primary" icon="delete" @click="handleMemberLvRule('delete')">删除</a-button> -->
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="moneyQuota" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handleMemberLvRule('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='delete'?'400px':'80%'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选会员等级规则？</p>

      <div v-else class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24" v-if="editType!='edit'">
              <a-form-item label="选择店铺" :required="true">
                <a-select placeholder="请选择店铺" v-model="forms.shopId" :disabled="editType=='detail'" @popupScroll="scrollShopLoading">
                  <a-select-option value="" disabled>请选择店铺</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of shopList" :key="i">{{v.shopName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="会员等级名称" :required="true">
                <a-input v-model="forms.membershipName" :disabled="editType=='detail'" placeholder="请输入会员等级名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="累计消费金额" :required="true">
                <a-input type="number" v-model="forms.moneyQuota" addonAfter="元" :disabled="editType=='detail'" placeholder="请输入累计消费金额" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

    </a-modal>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'

import {
  addMemberLvRule,
  getMemberLvRuleInfo,
  getMemberLvRuleData,
  modifyMemberLvRule,
  getShopList
} from '@/api/common'
const columns = [
  {
    title: '会员等级名',
    dataIndex: 'membershipName'
  },
  {
    title: '消费指标(元)',
    dataIndex: 'moneyQuota',
    scopedSlots: { customRender: 'moneyQuota' }
  },
  {
    title: '创建时间',
    dataIndex: 'addDataTime'
  },
  {
    title: '操作',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'memberLvRule',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        shopId: '',
        membershipName: null,
        startTime: '',
        endTime: ''
      },
      dateTime: [],
      columns, // 表头
      loadDatas: [], // 表格请求的数据
      pagination: false, // 不显示分页
      // 分页
      pageSizeOptions: ['10', '30', '50', '100'],
      currentPage: 1, // 当前的页数
      pageSize: 10, // 每页显示的条数
      totalPage: 0, // 总页数
      totalCount: 0, // 总条数
      loading: false,

      selectedRowKeys: [], // 选中行键
      selectedRows: [], // 选中行键值,

      // 店铺
      currentPageShop: 1, // 当前的页数
      pageSizeShop: 10, // 每页显示的条数
      totalPageShop: 0, // 总页数
      totalCountShop: 0, // 总条数
      shopList: [],

      editType: 'add',
      modalTitle: '新增',
      visible: !1,
      confirmLoading: !1,

      forms: {}
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.membershipName = null
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
      this.currentPage = 1
      this.getMemberLvRuleList()
    },

    // 高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作会员等级规则
    handleMemberLvRule(e, o) {
      this.forms = {}
      this.editType = e
      if (e == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          shopId: '',
          membershipName: null,
          moneyQuota: null
        }
      } else if (e == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项!')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getMemberLvRuleInfo()
        }
      } else if (e == 'detail') {
        this.modalTitle = '会员等级规则详情'
        this.getMemberLvRuleInfo(o.id)
      } else if (e == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项!')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deletedMemberLvRule()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditMemberLvRule()
      }
    },

    // 校验数据
    checkData() {
      const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      if (!this.forms.shopId) {
        this.$message.warning('请选择店铺！')
        return false
      } else if (!this.forms.membershipName) {
        this.$message.warning('请输入会员等级名称！')
        return false
      } else if (!reg.test(this.forms.moneyQuota)) {
        this.$message.warning('请输入有效的累计消费金额！')
        return false
      } else {
        return true
      }
    },

    // 添加、编辑
    addOrEditMemberLvRule() {
      const _type = this.editType

      const _data = { ...this.forms }

      switch (_type) {
        case 'add':
          addMemberLvRule(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getMemberLvRuleList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyMemberLvRule(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getMemberLvRuleList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
      }
    },

    deletedMemberLvRule() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeMemberLvRule(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getMemberLvRuleList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取会员等级规则数据列表
    getMemberLvRuleList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getMemberLvRuleData(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.result.currentPage
            this.pageSize = res.result.pageSize
            this.totalPage = res.result.totalPage
            this.totalCount = res.result.totalCount
            if (res.result.list.length > 0) {
              this.loadDatas = res.result.list
            } else {
              this.loadDatas = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取会员等级规则信息
    getMemberLvRuleInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getMemberLvRuleInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.result
            this.forms = _info
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getMemberLvRuleList()
    },

    // 获取店铺数据列表
    getShopList() {
      const _data = {
        pageSize: this.pageSizeShop,
        currentPage: this.currentPageShop,
        where: {
          state: 'enabled',
          auditState: 'pass'
        }
      }
      return new Promise((resolve, reject) => {
        getShopList(_data)
          .then(res => {
            this.loading = !1
            if (res.code == 0) {
              this.currentPageShop = res.result.currentPage
              this.pageSizeShop = res.result.pageSize
              this.totalPageShop = res.result.totalPage
              this.totalCountShop = res.result.totalCount

              let _list = res.result.list
              let _shopList = this.shopList
              if (_list.length > 0) {
                const _newList = _shopList.concat(_list)
                this.queryParam.shopId = _newList[0].id
                this.shopList = _newList
              } else {
                this.shopList = []
              }
            } else {
              this.$message.error(res.msg)
            }
            resolve(res)
          })
          .catch(err => {
            reject(err)
          })
      })
    },

    onChangeShop() {
      this.currentPage = 1
      this.getMemberLvRuleList()
    },

    //下拉列表滚动时的回调
    scrollShopLoading() {
      this.currentPageShop = this.currentPageShop + 1
      if (this.currentPageShop <= this.totalPageShop) {
        this.getShopList()
      }
    }
  },
  created() {
    // 列表数据请求
    this.getShopList().then(res => {
      this.getMemberLvRuleList()
    })
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-table table {
  table-layout: fixed;
}
/deep/ .ant-table table td {
  white-space: nowrap; /*控制单行显示*/
  overflow: hidden; /*超出隐藏*/
  text-overflow: ellipsis; /*隐藏的字符用省略号表示*/
}
.table-operator {
  margin-bottom: 10px;
}
.ant-pagination {
  margin-top: 20px;
  text-align: center;
}
.modal-container {
  max-height: 650px;
  padding: 0 12px;
  overflow-y: auto;
}
.card-item-title {
  font-size: 16px;
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
}
</style>
