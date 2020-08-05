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
              <a-input v-model="queryParam.customerNickname" placeholder="请输入会员昵称" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="会员编号">
                <a-input v-model="queryParam.userNumber" placeholder="请输入会员编号" />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="会员姓名">
                <a-input v-model="queryParam.customerName" placeholder="请输入会员姓名" />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="距离生日还剩">
                <a-select placeholder="请选择距离生日剩余天数" v-model="queryParam.birthdayRange">
                  <a-select-option :value="null">全部</a-select-option>
                  <a-select-option :value="i" v-for="i of 7" :key="i">{{i}} 天</a-select-option>
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
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleMember('add')">设为店员</a-button>
      <a-button type="primary" icon="download" @click="handleMember('export')">导出距生日剩7天的会员</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="headPic" slot-scope="record">
        <img :src="record?record:defaultImg" class="avatar" />
      </template>

      <template slot="gender" slot-scope="record">
        {{record=='man'?'男':record=='woman'?'女':'未知'}}
      </template>

      <template slot="birthdayRange" slot-scope="record">
        {{record?record:'未设置生日'}}
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handleMember('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='add'?'400px':editType=='export'?'400px':'80%'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

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
      <div v-if="editType=='export'" class="modal-container">
        <p>确认导出距生日还剩7天的会员吗？</p>
      </div>
      <div v-if="editType=='detail'" class="modal-container">
        <detail-list title="会员详情">
          <detail-list-item term="头像"><img :src="memberInfo.headPic?memberInfo.headPic:defaultImg" style="width:40px;height:40px;border-radius:50%;" /></detail-list-item>
          <detail-list-item term="会员编号">{{memberInfo.userNumber}}</detail-list-item>
          <detail-list-item term="会员昵称">{{memberInfo.nickname}}</detail-list-item>
        </detail-list>
        <detail-list>
          <detail-list-item term="会员姓名">{{memberInfo.name||''}}</detail-list-item>
          <detail-list-item term="手机号">{{memberInfo.phoneNumber||''}}</detail-list-item>
          <detail-list-item term="微信号">{{memberInfo.wechat||''}}</detail-list-item>
        </detail-list>
        <detail-list>
          <detail-list-item term="性别">{{memberInfo.gender=='man'?'男':memberInfo.gender=='women'?'女':'未知'}}</detail-list-item>
          <detail-list-item term="生日">{{memberInfo.birthday||''}}</detail-list-item>
          <detail-list-item term="年龄">{{memberInfo.age||''}}</detail-list-item>
        </detail-list>
        <detail-list>
          <detail-list-item term="省市区">{{`${memberInfo.province||''} ${memberInfo.city||''} ${memberInfo.area||''}`}}</detail-list-item>
        </detail-list>
        <a-divider style="margin-bottom: 32px" />

      </div>

    </a-modal>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import DetailList from '@/components/tools/DetailList'
const DetailListItem = DetailList.Item
import { getMemberData, getMemberInfo, addShopClerk, getShopList, getRoleList, exportShopClerk } from '@/api/common'
const columns = [
  {
    title: '会员编号',
    dataIndex: 'userNumber'
  },
  {
    title: '会员昵称',
    dataIndex: 'nickname'
  },
  {
    title: '手机号',
    dataIndex: 'phoneNumber'
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
  },
  {
    title: '距离生日',
    dataIndex: 'birthdayRange',
    scopedSlots: { customRender: 'birthdayRange' }
  },
  {
    title: '生日',
    dataIndex: 'birthday'
  },
  {
    title: '操作',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'memberList',
  components: {
    Pagination,
    DetailList,
    DetailListItem
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        shopId: '',
        customerNickname: null,
        customerName: null,
        userNumber: null,
        birthdayRange: null,
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

      memberInfo: {},
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

      this.queryParam.customerNickname = null
      this.queryParam.customerName = null
      this.queryParam.userNumber = null
      this.queryParam.birthdayRange = null
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
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
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作会员
    handleMember(e, o) {
      this.memberInfo = {}
      this.editType = e
      if (e == 'add') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择要设为店员的用户!')
          return false
        } else {
          this.modalTitle = '新增店员'
          this.visible = !0
          this.getRoleList()
        }
      } else if (e == 'detail') {
        this.modalTitle = '会员详情'
        this.getMemberInfo(o.id)
      } else if (e == 'export') {
        this.modalTitle = '导出'
        this.visible = !0
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'add') {
        const flag = this.checkData()
        flag && this.addShopClerk()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else if (_type == 'export') {
        this.exportShopClerkCsv()
      }
    },

    // 校验数据
    checkData() {
      if (!this.roleCode) {
        this.$message.warning('请选择店员的角色!')
        return false
      } else {
        return true
      }
    },

    // 添加店员
    addShopClerk() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })

      const data = {
        shopId: this.queryParam.shopId,
        roleCode: this.roleCode,
        ids: _idsArr
      }

      addShopClerk(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getMemberList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 导出
    exportShopClerkCsv() {
      exportShopClerk(this.queryParam.shopId).then(res => {
        this.visible = !1

        const content = res
        const blob = new Blob([content])
        const fileName = '距离生日还剩7天的会员.csv'
        if ('download' in document.createElement('a')) {
          // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      })
    },

    // 获取角色
    getRoleList() {
      getRoleList().then(res => {
        if (res.code == 0) {
          this.visible = !0
          if (res.result.length > 0) {
            this.roleList = res.result
          } else {
            this.roleList = []
          }
        } else {
          this.$message.error(res.msg)
        }
      })
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

    // 获取会员信息
    getMemberInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getMemberInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            const _info = res.result
            this.memberInfo = _info
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
    // 列表数据请求
    this.getShopList().then(res => {
      this.getMemberList()
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
