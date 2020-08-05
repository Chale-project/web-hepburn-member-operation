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
            <a-form-item label="储值卡名称">
              <a-input v-model="queryParam.cardName" placeholder="请输入储值卡名称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="储值卡编号">
                <a-input v-model="queryParam.rechargeCardNumber" placeholder="请输入储值卡编号" />
              </a-form-item>
            </a-col>

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
      <a-button type="primary" icon="plus" @click="handleRechargeCard('add')">新增</a-button>
      <!-- <a-button type="primary" icon="edit" @click="handleRechargeCard('edit')">编辑</a-button> -->
      <a-button type="primary" icon="delete" @click="handleRechargeCard('delete')">删除</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleRechargeCard('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="2" @click="handleRechargeCard('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量启禁用
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="cardMoney" slot-scope="record">
        {{record/100}}
      </template>
      <template slot="presentMoney" slot-scope="record">
        {{record/100}}
      </template>
      <template slot="presentJson" slot-scope="record">
        {{record?record:'无'}}
      </template>
      <template slot="cardState" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handleRechargeCard('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'80%':editType=='detail'?'80%':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <p v-if="editType=='delete'">确认删除所选储值卡？</p>
      <div class="modal-container" v-else-if="editType=='enabled'">
        <p>确认启用所选储值卡？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='disabled'">
        <p>确认禁用所选储值卡？</p>
      </div>
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
              <a-form-item label="储值卡名称" :required="true">
                <a-input v-model="forms.cardName" :disabled="editType=='detail'" placeholder="请输入储值卡名称" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="储值金额" :required="true">
                <a-input type="number" v-model="forms.cardMoney" addonAfter="元" :disabled="editType=='detail'" placeholder="请输入储值金额" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="附赠金额">
                <a-input type="number" v-model="forms.presentMoney" addonAfter="元" :disabled="editType=='detail'" placeholder="请输入附赠金额（不填则不会附赠）" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="附赠积分">
                <a-input type="number" v-model="forms.presentIntegral" :disabled="editType=='detail'" placeholder="请输入附赠积分（不填则不会附赠）" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="自定义赠送">
                <a-textarea v-model="forms.presentJson" :disabled="editType=='detail'" placeholder="自定义赠送（如：）" :rows="4" />
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
  addRechargeCard,
  getRechargeCardInfo,
  getRechargeCardData,
  removeRechargeCard,
  enOrDisabledRechargeCard,
  getShopList
} from '@/api/common'
const columns = [
  {
    title: '储值卡编号',
    dataIndex: 'rechargeCardNumber'
  },
  {
    title: '储值卡名',
    dataIndex: 'cardName'
  },
  {
    title: '储值金额',
    dataIndex: 'cardMoney',
    scopedSlots: { customRender: 'cardMoney' }
  },
  {
    title: '赠送金额',
    dataIndex: 'presentMoney',
    scopedSlots: { customRender: 'presentMoney' }
  },
  {
    title: '赠送积分',
    dataIndex: 'presentIntegral'
  },
  {
    title: '自定义赠送',
    dataIndex: 'presentJson',
    scopedSlots: { customRender: 'presentJson' }
  },
  {
    title: '状态',
    dataIndex: 'cardState',
    scopedSlots: { customRender: 'cardState' }
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
        cardName: null,
        rechargeCardNumber: null,
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

      this.queryParam.cardName = null
      this.queryParam.rechargeCardNumber = null
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
      this.currentPage = 1
      this.getRechargeCardList()
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

    // 操作储值卡
    handleRechargeCard(e, o) {
      this.forms = {}
      this.editType = e
      if (e == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          shopId: '',
          cardName: null,
          cardMoney: null,
          presentMoney: null,
          presentIntegral: null,
          presentJson: null
        }
      } else if (e == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项!')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getRechargeCardInfo()
        }
      } else if (e == 'detail') {
        this.modalTitle = '储值卡详情'
        this.getRechargeCardInfo(o.id)
      } else if (e == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择删除项!')
          return false
        } else {
          this.modalTitle = '删除'
          this.visible = !0
        }
      } else if (e == 'enabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择启用项！')
          return false
        } else {
          this.modalTitle = '启用'
          this.visible = !0
        }
      } else if (e == 'disabled') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择禁用项！')
          return false
        } else {
          this.modalTitle = '禁用'
          this.visible = !0
        }
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deletedRechargeCard()
      } else if (_type == 'enabled' || _type == 'disabled') {
        this.setBatchRechargeCardState()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditRechargeCard()
      }
    },

    // 校验数据
    checkData() {
      const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
      const _formData = this.forms
      if (!_formData.shopId) {
        this.$message.warning('请选择店铺！')
        return false
      } else if (!_formData.cardName) {
        this.$message.warning('请输入储值卡名称！')
        return false
      } else if (!reg.test(_formData.cardMoney)) {
        this.$message.warning('请输入有效的储值金额！')
        return false
      } else if (_formData.presentMoney) {
        if (!reg.test(_formData.presentMoney)) {
          this.$message.warning('请输入有效的赠送金额！')
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },

    // 添加、编辑
    addOrEditRechargeCard() {
      const _type = this.editType

      const _data = { ...this.forms }

      switch (_type) {
        case 'add':
          addRechargeCard(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getRechargeCardList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyRechargeCard(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getRechargeCardList()
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

    // 删除
    deletedRechargeCard() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeRechargeCard(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getRechargeCardList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 批量启用禁用
    setBatchRechargeCardState() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const data = {
        ids: _idsArr,
        state: this.editType == 'enabled' ? 'enabled' : 'disabled'
      }
      enOrDisabledRechargeCard(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getRechargeCardList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取储值卡数据列表
    getRechargeCardList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getRechargeCardData(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPage = res.page.currentPage
            this.pageSize = res.page.pageSize
            this.totalPage = res.page.totalPage
            this.totalCount = res.page.totalCount
            if (res.page.list.length > 0) {
              this.loadDatas = res.page.list
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

    // 获取储值卡信息
    getRechargeCardInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getRechargeCardInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.info
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
      this.getRechargeCardList()
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
      this.getRechargeCardList()
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
      this.getRechargeCardList()
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
