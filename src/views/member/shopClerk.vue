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
            <a-form-item label="店员编号">
              <a-input v-model="queryParam.clerkNumber" placeholder="请输入店员编号" />
            </a-form-item>
          </a-col>

          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="店员昵称">
                <a-input v-model="queryParam.customerNickname" placeholder="请输入店员昵称" />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="店员姓名">
                <a-input v-model="queryParam.customerName" placeholder="请输入店员姓名" />
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
      <a-button type="primary" icon="edit" @click="handleShopClerk('editRole')">设置员工角色</a-button>
      <a-button icon="delete" @click="handleShopClerk('delete')">批量删除</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleShopClerk('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <a-menu-item key="2" @click="handleShopClerk('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量启禁用
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button type="primary" icon="setting" @click="handleShopClerk('setAccount')">设置员工APP端登录账号密码</a-button>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="headPic" slot-scope="record">
        <img :src="record?record:defaultImg" class="avatar" />
      </template>
      <template slot="clerkHeadPic" slot-scope="record">
        <img v-if="record" :src="record" class="avatar-image" @click="handlePreview(record)" />
        <span v-else>未设置</span>
      </template>

      <template slot="customerPhoneNumber" slot-scope="record">
        {{record?record:'未设置'}}
      </template>

      <template slot="clerkState" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handleShopClerk('editNo', record)">设置编号</a>
        <a-divider type="vertical" />
        <a @click="handleShopClerk('image', record)">设置照片</a>
      </template>

    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">
      <div class="modal-container" v-if="editType=='delete'">
        <p>确认删除所选店员？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='enabled'">
        <p>确认启用所选店员？</p>
      </div>
      <div class="modal-container" v-else-if="editType=='disabled'">
        <p>确认禁用所选店员？</p>
      </div>
      <div v-else-if="editType=='editNo'" class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="店员编号" :required="true">
                <a-input v-model="forms.clerkNumber" placeholder="请填写店员编号" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div v-else-if="editType=='editRole'" class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="所属角色" required>
                <a-radio-group v-model="forms.roleCode">
                  <a-radio :value="v.roleCode" v-for="(v,i) of roleList" :key="i">{{v.roleName}}</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div v-else-if="editType=='setAccount'" class="modal-container">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="登录账号" required>
                <a-input v-model="formsAp.account" maxlength="11" placeholder="请填写11位手机号" />
              </a-form-item>
            </a-col>
            <a-col :md="24" :sm="24">
              <a-form-item label="登录密码" required>
                <a-input type="password" v-model="formsAp.password" placeholder="请填写至少6位字符密码" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div v-else-if="editType=='image'" class="modal-container">
        <a-upload :action="action" :headers="headers" :showUploadList="false" listType="picture-card" class="avatar-uploader" :beforeUpload="beforeUpload" @change="handleImageUpload">
          <img v-if="forms.clerkHeadPic" :src="forms.clerkHeadPic" width="100" />
          <div v-else>
            <a-icon :type="imageLoading ? 'loading' : 'plus'" />
            <div class="ant-upload-text">上传</div>
          </div>
        </a-upload>
      </div>

    </a-modal>

    <!-- 查看图片模态框 -->
    <a-modal :visible="previewVisible" :footer="null" @cancel="previewCancel">
      <img style="width: 100%" :src="previewImage" />
    </a-modal>

  </div>
</template>

<script>
import Pagination from '@/components/pagination/pagination'
import md5 from 'md5'

import {
  getShopClerkInfo,
  getShopClerkData,
  removeShopClerk,
  modifyShopClerk,
  setShopClerkAccount,
  enOrDisabledShopClerk,
  getShopList,
  getRoleList,
  uploadFile
} from '@/api/common'
const columns = [
  {
    title: '店员编号',
    dataIndex: 'clerkNumber'
  },
  {
    title: '店员昵称',
    dataIndex: 'customerNickname'
  },
  {
    title: '店员账号',
    dataIndex: 'customerPhoneNumber',
    scopedSlots: { customRender: 'customerPhoneNumber' }
  },
  {
    title: '店员姓名',
    dataIndex: 'customerName'
  },
  {
    title: '头像',
    dataIndex: 'headPic',
    scopedSlots: { customRender: 'headPic' }
  },
  {
    title: '工作照',
    dataIndex: 'clerkHeadPic',
    scopedSlots: { customRender: 'clerkHeadPic' }
  },
  {
    title: '角色',
    dataIndex: 'roleName'
  },
  {
    title: '所属店铺',
    dataIndex: 'shopName'
  },
  {
    title: '店员状态',
    dataIndex: 'clerkState',
    scopedSlots: { customRender: 'clerkState' }
  },
  {
    title: '操作',
    width: '160px',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'shopClerk',
  components: {
    Pagination
  },
  data() {
    return {
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        shopId: '',
        clerkNumber: null,
        customerNickname: null,
        customerName: null,
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

      editType: 'delete',
      modalTitle: '删除店员',
      visible: !1,
      confirmLoading: !1,

      roleList: [], // 员工角色list

      forms: {},

      action: uploadFile,
      headers: { token: this.$ls.get('Access_Token') },
      imageLoading: !1,

      previewVisible: !1,
      previewImage: '',

      formsAp: {},
      
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

      this.queryParam.clerkNumber = null
      this.queryParam.customerNickname = null
      this.queryParam.customerName = null
      this.queryParam.startTime = ''
      this.queryParam.endTime = ''
    },

    // 查询
    queryOrder() {
      this.currentPage = 1
      this.getShopClerkList()
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

    // 关闭查看图片
    previewCancel() {
      this.previewVisible = !1
    },

    // 查看图片
    handlePreview(img) {
      this.previewImage = img
      this.previewVisible = !0
    },

    //文件上传前过滤
    beforeUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isGIF = file.type === 'image/gif'
      const isPNG = file.type === 'image/png'
      const isBMP = file.type === 'image/bmp'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isGIF && !isPNG && !isBMP) {
        this.$message.warning('上传图片必须是JPG/GIF/PNG/BMP 格式!')
      }
      if (!isLt2M) {
        this.$message.warning('上传图片大小不能超过 2MB!')
      }

      return (isJPG || isBMP || isGIF || isPNG) && isLt2M
    },

    // 上传图片
    handleImageUpload(info) {
      if (info.file.status === 'uploading') {
        this.imageLoading = !0
        return
      }
      if (info.file.status == 'done') {
        this.imageLoading = !1
        if (info.file.response.code == 0) {
          const imgUrl = info.file.response.url
          this.forms.clerkHeadPic = imgUrl
        } else {
          this.$message.error('上传失败!')
        }
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 操作店员
    handleShopClerk(e, o) {
      this.editType = e
      if (e == 'delete') {
        if (this.selectedRows.length < 1) {
          this.$message.warning('请选择要删除的店员!')
          return false
        } else {
          this.modalTitle = '删除店员'
          this.visible = !0
        }
      } else if (e == 'editNo') {
        this.modalTitle = '修改编号'
        this.getShopClerkInfo(o.id)
      } else if (e == 'image') {
        this.modalTitle = '设置店员工作照'
        this.getShopClerkInfo(o.id)
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
      } else if (e == 'editRole') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '设置员工角色'
          this.getShopClerkInfo()
        }
      } else if (e == 'setAccount') {
        this.formsAp = {
          account: null,
          password: null
        }
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一角色！')
          return false
        } else {
          this.formsAp.account = this.selectedRows[0].customerPhoneNumber || null
          this.modalTitle = '设置员工APP端登录账号'
          this.visible = !0
        }
      }
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'delete') {
        this.deleteShopClerk()
      } else if (_type == 'enabled' || _type == 'disabled') {
        this.setBatchShopClerkState()
      } else if (_type == 'editNo' || _type == 'image') {
        this.modifyShopClerkNumber()
      } else if (_type == 'editRole') {
        const flag = this.checkRole()
        flag && this.modifyShopClerkRole()
      } else if (_type == 'setAccount') {
        const flag = this.checkAccountPassword()
        flag && this.setShopClerkAccountPassword()
      }
    },

    // 修改店员编号
    modifyShopClerkNumber() {
      const _data = this.forms
      modifyShopClerk(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getShopClerkList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 校验员工角色
    checkRole() {
      if (!this.forms.roleCode) {
        this.$message.warning('请选择员工角色!')
        return false
      } else {
        return true
      }
    },

    // 修改员工角色
    modifyShopClerkRole() {
      const _data = this.forms
      modifyShopClerk(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getShopClerkList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 删除店员
    deleteShopClerk() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      removeShopClerk(_idsArr).then(res => {
        if (res.code == 0) {
          this.visible = !1
          this.$message.success('删除成功！')
          this.getShopClerkList()
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 批量启用禁用店员
    setBatchShopClerkState() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const data = {
        ids: _idsArr,
        state: this.editType == 'enabled' ? 'enabled' : 'disabled'
      }
      enOrDisabledShopClerk(data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getShopClerkList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 校验员工账号密码
    checkAccountPassword() {
      const _formData = this.formsAp
      const mobileReg = /^(1)[0-9]{10}$/
      if (!mobileReg.test(_formData.account)) {
        this.$message.warning('请输入有效的手机号！')
        return false
      } else if (_formData.password.length < 6) {
        this.$message.warning('请输入至少6位有效密码！')
        return false
      } else {
        return true
      }
    },

    // 设置员工账号密码
    setShopClerkAccountPassword() {
      const _data = this.formsAp
      _data.id = this.selectedRows[0].id
      _data.password = md5(_data.password)
      setShopClerkAccount(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('操作成功！')
            this.getShopClerkList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取角色
    getRoleList() {
      getRoleList().then(res => {
        if (res.code == 0) {
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

    // 获取店员数据列表
    getShopClerkList() {
      this.initSelectedRows()
      const _queryParam = { ...this.queryParam }
      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: _queryParam
      }
      getShopClerkData(_data)
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

    // 获取店员信息
    getShopClerkInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getShopClerkInfo(_id)
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
      this.getShopClerkList()
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
      this.getShopClerkList()
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
      this.getShopClerkList()
    })
    this.getRoleList()
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
.avatar-image {
  width: 50px;
  height: 50px;
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

/deep/ .avatar-uploader .ant-upload.ant-upload-select-picture-card {
  width: 200px;
  height: 200px;
  margin: 0 auto;
  overflow: hidden;
}
</style>
