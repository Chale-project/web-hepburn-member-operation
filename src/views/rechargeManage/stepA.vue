<template>
  <div>

    <!-- step one -->
    <a-card title="选择会员" :bordered="false">
      <div class="step-page-search-wrapper">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="8" :sm="24">
              <a-form-item label="选择店铺" :labelCol="{span:8}" :wrapperCol="{span:16}">
                <a-select placeholder="请选择店铺" v-model="queryParam.shopId" @change="onChangeShop" @popupScroll="scrollShopLoading">
                  <a-select-option value="" disabled>请选择店铺</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of shopList" :key="i">{{v.shopName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="会员昵称" :label-col="{span:8}" :wrapper-col="{span:16}">
                <a-input v-model="queryParam.customerNickname" placeholder="请输入会员昵称" />
              </a-form-item>
            </a-col>

            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="会员姓名" :label-col="{span:8}" :wrapper-col="{span:16}">
                  <a-input v-model="queryParam.customerName" placeholder="请输入会员姓名" />
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="queryMember">查询</a-button>
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

      <div class="step-page-table-wrapper">
        <!--表格-->

        <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'radio', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
          <template slot="headPic" slot-scope="record">
            <img :src="record?record:defaultImg" class="avatar" />
          </template>

          <template slot="gender" slot-scope="record">
            {{record=='man'?'男':record=='woman'?'女':'未知'}}
          </template>

        </a-table>
        <!--分页-->
        <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

      </div>

    </a-card>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'

import { getMemberData, getShopList } from '@/api/common'
const columns = [
  {
    title: '会员昵称',
    dataIndex: 'nickname'
  },
  {
    title: '会员姓名',
    dataIndex: 'name'
  },
  {
    title: '头像',
    dataIndex: 'headPic',
    scopedSlots: { customRender: 'headPic' }
  },
  {
    title: '性别',
    dataIndex: 'gender',
    scopedSlots: { customRender: 'gender' }
  }
]
export default {
  name: 'stepA',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        shopId: '',
        customerNickname: null,
        customerName: null
      },
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
      shopList: []
    }
  },
  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 重置
    resetQueryParam() {
      this.queryParam.customerNickname = null
      this.queryParam.customerName = null
    },

    // 查询
    queryMember() {
      this.currentPage = 1
      this.getMemberList()
    },

    // 高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      this.$emit('userId', selectedRows[0].userNumber)
    },

    // 获取会员数据列表
    getMemberList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getMemberData(_data)
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

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getMemberList()
    },

    // 切换店铺
    onChangeShop() {
      this.currentPage = 1
      this.getMemberList()
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
                this.$emit('shopId', _newList[0].id)
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
    onChangeShop(e) {
      this.$emit('transmitShopId', e)

      this.currentPage = 1
      this.getMemberList()
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
    this.getShopList().then(res => {
      this.getMemberList()
    })
  }
}
</script>

<style lang="less" scoped>
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>