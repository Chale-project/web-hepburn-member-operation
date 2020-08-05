<template>
  <div style="background:#fff ;padding:25px;position: relative">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="店铺名称">
              <a-input v-model="queryParam.shopName" placeholder="请输入店铺名称" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="店铺编号">
              <a-input v-model="queryParam.shopNumber" placeholder="请输入店铺编号" />
            </a-form-item>
          </a-col>
          <template v-if="advanced">
            <a-col :md="8" :sm="24">
              <a-form-item label="商户名称">
                <a-input v-model="queryParam.merchantName" placeholder="请输入商户名称" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="商户编号">
                <a-input v-model="queryParam.merchantNumber" placeholder="请输入商户编号" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="联系电话">
                <a-input v-model="queryParam.phoneNumber" placeholder="请输入联系电话" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="店铺状态">
                <a-select placeholder="请选择" v-model="queryParam.state">
                  <a-select-option value="">全部</a-select-option>
                  <a-select-option value="enabled">启用</a-select-option>
                  <a-select-option value="disabled">禁用</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

          </template>
          <a-col :md="!advanced && 8 || 24" :sm="24">
            <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
              <a-button type="primary" @click="queryShop">查询</a-button>
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
      <a-button type="primary" icon="plus" @click="handleShop('add')">新增</a-button>
      <a-button type="primary" icon="edit" @click="handleShop('edit')">编辑</a-button>
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleShop('enabled')">
            <a-icon type="unlock" />启用
          </a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2" @click="handleShop('disabled')">
            <a-icon type="lock" />禁用
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          启禁操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!--表格-->
    <a-table size="middle" :columns="columns" :dataSource="loadDatas" :loading="loading" :pagination="pagination" :rowSelection="{type:'checkbox', selectedRowKeys: selectedRowKeys, onChange: updateSelect }">
      <template slot="shopNumber" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>
      <template slot="shopName" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>
      <template slot="merchantName" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>
      <template slot="merchantNumber" slot-scope="record">
        <a-tooltip placement="topLeft">
          <template slot='title'>
            {{record}}
          </template>
          {{record}}
        </a-tooltip>
      </template>

      <template slot="state" slot-scope="record">
        <a-tag v-if="record=='enabled'" color="#87d068">启用</a-tag>
        <a-tag v-else-if="record=='disabled'" color="#ff0000">禁用</a-tag>
      </template>

      <template slot="auditState" slot-scope="record">
        <a-tag v-if="record=='not'">未审核</a-tag>
        <a-tag v-else-if="record=='pass'" color="#87d068">通过</a-tag>
        <a-tag v-else-if="record=='notpass'" color="#ff0000">不通过</a-tag>
      </template>

      <template slot="Action" slot-scope="text, record">
        <a @click="handleShop('detail', record)">详情</a>
      </template>
    </a-table>
    <!--分页-->
    <Pagination :current="currentPage" :pageSizeOptions="pageSizeOptions" :pageSize="pageSize" :total="totalCount" :totalPage="totalPage" @change="changePage"></Pagination>

    <!-- 新增编辑模态框 -->
    <a-modal :width="editType=='edit'?'800px':editType=='detail'?'800px':editType=='add'?'800px':'400px'" :title="modalTitle" :visible="visible" @ok="handleOk" :confirmLoading="confirmLoading" @cancel="handleCancel">

      <p v-if="editType=='enabled'">确认启用所选店铺？</p>

      <div class="modal-container" v-else-if="editType=='disabled'">
        <a-form>
          <a-row :gutter="24">
            <a-col :md="24" :sm="24">
              <a-form-item label="禁用原因" :required="true">
                <a-textarea v-model="disableReason" :rows="4" placeholder="请填写禁用原因" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <div class="modal-container" v-else>
        <a-form>
          <a-row :gutter="24">
            <a-col :md="12" :sm="24" v-if="editType=='add'">
              <a-form-item label="所属商户" :required="true">
                <a-select placeholder="请选择商户" v-model="forms.merchantId" :disabled="editType=='detail'" @focus="onFocusGetMerchant" @popupScroll="scrollMerchantLoading">
                  <a-select-option value="" disabled>请选择商户</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of merchantList" :key="i">{{v.merchantName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="店铺名称" :required="true">
                <a-input v-model="forms.shopName" :disabled="editType=='detail'" placeholder="店铺名称" />
              </a-form-item>
            </a-col>
            <a-col :md="12" :sm="24">
              <a-form-item label="联系人电话" :required="true">
                <a-input v-model="forms.phoneNumber" maxlength="11" :disabled="editType=='detail'" placeholder="请输入有效的手机号" />
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="店铺Logo" :required="true">
                <div class="shop-image">
                  <a-upload :action="action" :headers="headers" :showUploadList="false" listType="picture-card" class="avatar-uploader" :disabled="editType=='detail'" :beforeUpload="beforeUpload" @change="handleImageUpload">
                    <img v-if="forms.shopLogo" :src="forms.shopLogo?forms.shopLogo:defaultImage" width="100" />
                    <div v-else>
                      <a-icon :type="imageLoading ? 'loading' : 'plus'" />
                      <div class="ant-upload-text">上传</div>
                    </div>
                  </a-upload>
                </div>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="选择省份" :required="true">
                <a-select placeholder="请选择省份" v-model="forms.province" :disabled="editType=='detail'" @change="onChangeProvince">
                  <a-select-option value="" disabled>请选择省份</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of provinceList" :key="i">{{v.regionName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="选择城市" :required="true">
                <a-select placeholder="请选择城市" v-model="forms.city" :disabled="editType=='detail'">
                  <a-select-option value="" disabled>请选择城市</a-select-option>
                  <a-select-option :value="v.id" v-for="(v,i) of cityList" :key="i">{{v.regionName}}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :md="12" :sm="24">
              <a-form-item label="详细地址">
                <a-input v-model="forms.shopAddress" :disabled="editType=='detail'" placeholder="请输入店铺详细地址" />
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
  addShop,
  getShopInfo,
  getShopList,
  enabledShop,
  disabledShop,
  modifyShop,
  getMerchantList,
  getProvince,
  getCity,
  uploadFile
} from '@/api/common'
import { mobileToStar } from '@/utils/util'

const columns = [
  {
    title: '店铺编号',
    width: '15%',
    dataIndex: 'shopNumber',
    scopedSlots: { customRender: 'shopNumber' }
  },
  {
    title: '店铺名称',
    width: '15%',
    dataIndex: 'shopName',
    scopedSlots: { customRender: 'shopName' }
  },
  {
    title: '联系电话',
    width: '15%',
    dataIndex: 'phoneNumber'
  },
  {
    title: '所属商户',
    width: '15%',
    dataIndex: 'merchantName',
    scopedSlots: { customRender: 'merchantName' }
  },
  {
    title: '商户编号',
    width: '15%',
    dataIndex: 'merchantNumber',
    scopedSlots: { customRender: 'merchantNumber' }
  },
  {
    title: '店铺状态',
    width: '10%',
    align: 'center',
    dataIndex: 'state',
    scopedSlots: { customRender: 'state' }
  },

  {
    title: '操作',
    width: '10%',
    align: 'center',
    dataIndex: 'Action',
    scopedSlots: { customRender: 'Action' }
  }
]

export default {
  name: 'shopList',
  components: {
    Pagination
  },
  data() {
    return {
      mobileToStar,
      advanced: false, // 高级搜索 展开/关闭
      queryParam: {
        // 搜索查询参数
        shopNumber: null,
        shopName: null,
        merchantName: null,
        merchantNumber: null,
        phoneNumber: null,
        state: ''
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

      forms: {},
      editType: 'edit',
      modalTitle: '编辑',
      visible: !1,
      confirmLoading: !1,

      currentPageMerchant: 1,
      pageSizeMerchant: 10,
      totalPageMerchant: 0,
      totalCountMerchant: 0,
      merchantList: [], // 商户

      action: uploadFile,
      headers: { token: this.$ls.get('Access_Token') },
      imageLoading: !1,

      // 禁用原因
      disableReason: null,

      provinceList: [],
      cityList: [],
      defaultImage: '/logo.png'
    }
  },

  methods: {
    initSelectedRows() {
      this.selectedRowKeys = []
      this.selectedRows = []
    },

    // 高级搜索 展开/收起
    toggleAdvanced() {
      this.advanced = !this.advanced
    },

    // 时间筛选
    onChangeDateTime(e, l) {
      this.dateTime = e
      this.queryParam.startTime = l[0]
      this.queryParam.endTime = l[1]
    },

    // 查询
    queryShop() {
      this.currentPage = 1
      this.getShopList()
    },

    // 重置
    resetQueryParam() {
      this.dateTime = []

      this.queryParam.shopName = null
      this.queryParam.shopNumber = null
      this.queryParam.merchantName = null
      this.queryParam.merchantNumber = null
      this.queryParam.phoneNumber = null
      this.queryParam.state = ''
    },

    // 选择跟新table中的某项
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
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
          this.forms.shopLogo = imgUrl
        } else {
          this.$message.error('上传失败!')
        }
      }
    },

    // 取消
    handleCancel() {
      this.visible = !1
    },

    // 确认
    handleOk() {
      const _type = this.editType
      if (_type == 'enabled') {
        this.enabledShop()
      } else if (_type == 'disabled') {
        const flag = this.checkDisabledData()
        flag && this.disabledShop()
      } else if (_type == 'detail') {
        this.handleCancel()
      } else {
        const flag = this.checkData()
        flag && this.addOrEditShop()
      }
    },

    // 操作店铺
    handleShop(e, o, i) {
      this.forms = {}
      this.editType = e
      if (this.editType == 'add') {
        this.modalTitle = '新增'
        this.visible = !0
        this.forms = {
          merchantId: '',
          shopName: null,
          shopLogo: null,
          phoneNumber: null,
          province: '',
          city: '',
          shopAddress: null
        }
      } else if (this.editType == 'edit') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个编辑项！')
          return false
        } else {
          this.modalTitle = '编辑'
          this.getShopInfo()
        }
      } else if (this.editType == 'enabled') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个启用项！')
          return false
        } else {
          this.modalTitle = '启用'
          this.visible = !0
        }
      } else if (this.editType == 'disabled') {
        if (this.selectedRows.length != 1) {
          this.$message.warning('请选择一个禁用项！')
          return false
        } else {
          this.modalTitle = '禁用'
          this.visible = !0
        }
      } else if (this.editType == 'detail') {
        this.modalTitle = '详情'
        this.visible = !0
        this.getShopInfo(o.id)
      }
    },

    //禁用数据校验
    checkDisabledData() {
      if (!this.disableReason) {
        this.$message.warning('请填写禁用原因！')
        return false
      } else {
        return true
      }
    },

    // 数据校验
    checkData() {
      const _formData = this.forms
      const mobileReg = /^(1)[0-9]{10}$/
      if (!_formData.merchantId) {
        this.$message.warning('请选择所属商户！')
        return false
      } else if (!_formData.shopName) {
        this.$message.warning('请输入店铺名称！')
        return false
      } else if (!mobileReg.test(_formData.phoneNumber)) {
        this.$message.warning('请输入有效的手机号！')
        return false
      } else if (!_formData.shopLogo) {
        this.$message.warning('请上传店铺logo！')
        return false
      } else if (!_formData.province) {
        this.$message.warning('请选择省份！')
        return false
      } else if (!_formData.city) {
        this.$message.warning('请选择城市！')
        return false
      } else {
        return true
      }
    },

    // 添加编辑店铺
    addOrEditShop() {
      const _type = this.editType
      const _data = this.forms
      switch (_type) {
        case 'add':
          addShop(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getShopList()
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch(err => {
              console.log(err)
            })
          break
        case 'edit':
          modifyShop(_data)
            .then(res => {
              if (res.code == 0) {
                this.visible = !1
                this.$message.success('操作成功！')
                this.getShopList()
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

    // 启用
    enabledShop() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      enabledShop(_idsArr)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('启用成功！')
            this.getShopList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 禁用
    disabledShop() {
      const _idsArr = this.selectedRows.map(item => {
        return item.id
      })
      const _data = {
        id: _idsArr[0],
        disableReason: this.disableReason
      }
      disabledShop(_data)
        .then(res => {
          if (res.code == 0) {
            this.visible = !1
            this.$message.success('禁用成功！')
            this.getShopList()
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    // 获取店铺数据列表
    getShopList() {
      this.initSelectedRows()

      const _data = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        where: this.queryParam
      }
      getShopList(_data)
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
        .catch(err => {})
    },

    // 获取店铺信息
    getShopInfo(id) {
      let _id = null
      if (id) _id = id
      else _id = this.selectedRows[0].id
      getShopInfo(_id)
        .then(res => {
          if (res.code == 0) {
            this.visible = !0
            this.forms = res.result
            if (res.result.province) this.getCity(res.result.province)
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    //获取焦点时获取商户
    onFocusGetMerchant() {
      if (this.merchantList.length < 1) {
        this.currentPageMerchant = 1
        this.getMerchantList()
      }
    },

    // 获取商户数据列表
    getMerchantList() {
      const _data = {
        pageSize: this.pageSizeMerchant,
        currentPage: this.currentPageMerchant,
        where: {
          // state: 'enabled',
          // auditState: 'pass'
        }
      }
      getMerchantList(_data)
        .then(res => {
          this.loading = !1
          if (res.code == 0) {
            this.currentPageMerchant = res.page.currentPage
            this.pageSizeMerchant = res.page.pageSize
            this.totalPageMerchant = res.page.totalPage
            this.totalCountMerchant = res.page.totalCount

            let _list = res.page.list
            let _merchantList = this.merchantList
            if (_list.length > 0) {
              const _newList = _merchantList.concat(_list)
              this.merchantList = _newList
            } else {
              this.merchantList = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {})
    },

    //下拉列表滚动时的回调
    scrollMerchantLoading() {
      this.currentPageMerchant = this.currentPageMerchant + 1
      if (this.currentPageMerchant <= this.totalPageMerchant) {
        this.getMerchantList()
      }
    },

    // 分页
    changePage(obj) {
      this.currentPage = obj.currentPage
      this.pageSize = obj.pageSize
      this.getShopList()
    },

    // 省份change事件
    onChangeProvince(e) {
      this.getCity(e)
    },

    // 获取省份
    getProvince() {
      getProvince().then(res => {
        this.loading = !1
        if (res.code == 0) {
          const _list = res.regionList
          if (_list.length > 0) {
            this.provinceList = _list
          } else {
            this.provinceList = []
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取城市
    getCity(id) {
      getCity(id).then(res => {
        this.loading = !1
        if (res.code == 0) {
          const _list = res.regionList
          if (_list.length > 0) {
            this.cityList = _list
          } else {
            this.cityList = []
          }
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  },
  created() {
    // 列表数据请求
    this.getShopList()
  },
  mounted() {
    this.getProvince()
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
.shop-image {
  width: 105px;
  height: 105px;
  text-align: center;
  overflow: hidden;
}
.shop-image img {
  width: 100%;
}
</style>
