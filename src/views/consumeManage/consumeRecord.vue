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
            <a-form-item label="会员昵称">
              <a-input v-model="queryParam.buyerNick" placeholder="请输入消费会员昵称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="会员编号">
                <a-input v-model="queryParam.userNumber" placeholder="请输入会员编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="订单来源">
                <a-select placeholder="请选择" v-model="queryParam.orderSource">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="drinks">酒水消费</a-select-option>
                  <a-select-option value="compote">果盘消费</a-select-option>
                  <a-select-option value="otherConsume">其他消费</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="支付方式">
                <a-select placeholder="请选择" v-model="queryParam.paymentWay">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="weixin">微信</a-select-option>
                  <a-select-option value="alipay">支付宝</a-select-option>
                  <a-select-option value="bank">银行转账</a-select-option>
                  <a-select-option value="POS">POS机刷卡</a-select-option>
                  <a-select-option value="cash">现金</a-select-option>
                  <a-select-option value="present">赠送</a-select-option>
                  <a-select-option value="balance">余额</a-select-option>
                </a-select>
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
    <div class="table-operator"></div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">

      <template slot="orderNumber" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>

      <template slot="payment" slot-scope="record">
        {{record/100}}
      </template>

      <template slot="paymentWay" slot-scope="record">
        {{record=='weixin'?'微信':record=='alipay'?'支付宝':record=='bank'?'银行转账':record=='POS'?'POS机刷卡':record=='cash'?'现金':record=='present'?'赠送':record=='balance'?'余额':'其他'}}
      </template>

      <template slot="orderSource" slot-scope="record">
        {{record=='drinks'?'酒水消费':record=='compote'?'果盘消费':record=='otherConsume'?'其他消费':'未知'}}
      </template>

      <template slot="orderTitle" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'400px':'80%'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

      <div v-if="editType=='add'" class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="所属角色" required>
                <a-radio-group v-model="roleCode">
                  <a-radio :value="v.roleCode" v-for="(v,i) of roleList" :key="i">{{v.roleName}}</a-radio>
                </a-radio-group>
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

import { getOrderRecordData, addShopClerk, getShopList, getRoleList } from '@/api/common'
const columns = [
  {
    title: '订单编号',
    dataIndex: 'orderNumber',
    scopedSlots: { customRender: 'orderNumber' }
  },
  {
    title: '消费金额',
    dataIndex: 'payment',
    scopedSlots: { customRender: 'payment' }
  },
  {
    title: '支付方式',
    dataIndex: 'paymentWay',
    scopedSlots: { customRender: 'paymentWay' }
  },
  {
    title: '消费来源',
    dataIndex: 'orderSource',
    scopedSlots: { customRender: 'orderSource' }
  },
  {
    title: '会员编号',
    dataIndex: 'userNumber'
  },
  {
    title: '会员昵称',
    dataIndex: 'buyerNick'
  },
  {
    title: '消费类目',
    dataIndex: 'orderTitle',
    scopedSlots: { customRender: 'orderTitle' }
  },
  {
    title: '创建时间',
    dataIndex: 'addDataTime'
  }
]

export default {
  name: 'consumeRecord',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        orderType: 'consume', // recharge：消费；consume：消费
        shopId: '',
        buyerNick: null,
        userNumber: null,
        orderSource: '',
        paymentWay: '',
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
      modalTitle: '新增店员',
      visible: !1,
      confirmLoading: !1,

      roleCode: null, // 选择的角色
      roleList: [], // 角色列表

      consumeRecordInfo: {},
      defaultImg: '/logo.png'
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

      this.queryParam.buyerNick = null
      this.queryParam.userNumber = null
      this.queryParam.orderSource = ''
      this.queryParam.paymentWay = ''
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
      this.currentPage = 1
      this.getConsumeRecordList()
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

    // 操作消费记录
    handleConsumeRecord(e, o) {
      this.consumeRecordInfo = {}
      this.editType = e
      if (e == 'detail') {
        this.modalTitle = '消费记录详情'
        this.getConsumeRecordInfo(o.id)
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'detail') {
        this.handleCancel()
      }
    },

    // 获取消费记录数据列表
    getConsumeRecordList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getOrderRecordData(_data)
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

    // 获取消费记录信息
    getConsumeRecordInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getConsumeRecordInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.result
            this.consumeRecordInfo = _info
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
      this.getConsumeRecordList()
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

    // 切换店铺
    onChangeShop() {
      this.currentPage = 1
      this.getConsumeRecordList()
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
      this.getConsumeRecordList()
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
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
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
