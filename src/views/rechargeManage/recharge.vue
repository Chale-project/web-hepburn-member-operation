<template>
  <a-card :bordered="false">
    <a-steps :current="currentTab">
      <a-step title="选择会员" description="请选择您要为那个该店铺会员充值；" />
      <a-step title="充值方式" description="请选择“自定义金额”或“充值卡”充值；" />
      <a-step title="完成" description="请在客户小程序查看已充值金额。" />
    </a-steps>
    <div class="recharge-content">
      <stepA ref="stepA" v-if="currentTab === 0" @shopId="getShopId" @userId="getUserId" />
      <stepB ref="stepB" v-if="currentTab === 1" @type="getType" @cardId="getCardId" @money="getMoney" @payment="getPayment" @remark="getRemark" :shopId="shopId" />
      <stepC ref="stepC" v-if="currentTab === 2" />
    </div>
    <div class="recharge-footer" :style="{left:rechargeFooterStyle?'256px':'80px'}">
      <div class="operation-container">
        <a-button type="primary" icon="left" @click="prevStep" v-if="currentTab === 1">上一步</a-button>
        <a-button type="primary" @click="nextStep" style="margin-left:20px;" :loading="loading">{{ currentTab === 1 ? '确认充值' : currentTab === 2 ? '继续充值' : '下一步' }}
          <a-icon type="right" v-if="currentTab !== 2" />
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script>
import stepA from './stepA'
import stepB from './stepB'
import stepC from './stepC'
import { rechargeByCard, rechargeByMoney } from '@/api/common'

import { mapState } from 'vuex'

export default {
  name: 'recharge',
  components: {
    stepA,
    stepB,
    stepC
  },
  data() {
    return {
      shopId: '',
      userId: null,
      checkedCardId: null,
      money: null,
      payment: null,
      remark: null,
      currentTab: 0,
      loading: !1
    }
  },
  computed: {
    ...mapState({
      rechargeFooterStyle: state => state.app.sidebar
    })
  },

  created() {},

  mounted() {},

  methods: {
    initData() {
      this.currentTab = 0
      this.userId = null
      this.checkedCardId = null
      this.money = null
      this.payment = null
      this.remark = null
    },

    // 获取从子组件A的shopId
    getShopId(e) {
      this.shopId = e
    },

    // 获取从子组件A的userId
    getUserId(e) {
      this.userId = e
    },

    // 获取从子组件B的充值类型type
    getType(e) {
      this.rechargeType = e
    },

    // 获取从子组件B的充值卡id
    getCardId(e) {
      this.checkedCardId = e
    },

    // 获取从子组件B的充值金额money
    getMoney(e) {
      this.money = e
    },

    // 支付方式
    getPayment(e) {
      this.payment = e
    },

    // 备注
    getRemark(e) {
      this.remark = e
    },

    //上一步
    prevStep() {
      if (this.currentTab > 0) {
        this.currentTab -= 1
        this.initData()
      }
    },

    // 下一步
    nextStep(e) {
      if (this.currentTab === 0) {
        if (!this.userId) {
          this.$message.warning('请选择要充值的会员!')
          return
        }
        this.currentTab = 1
      } else if (this.currentTab === 1) {
        const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
        if (this.rechargeType == 'money' && !reg.test(this.money)) {
          this.$message.warning('请选择输入有效的充值金额!')
          return
        }
        if (this.rechargeType == 'rechargeCard' && !this.checkedCardId) {
          this.$message.warning('请选择要充值卡!')
          return
        }
        if (!this.payment) {
          this.$message.warning('请选择支付方式!')
          return
        }
        this.recharge()
      } else if (this.currentTab == 2) {
        this.initData()
        return
      }
    },

    // 储值
    recharge() {
      this.loading = !0

      const _type = this.rechargeType
      switch (_type) {
        case 'rechargeCard':
          const _data = {
            shopId: this.shopId,
            id: this.checkedCardId,
            userNumber: this.userId,
            paymentWay: this.payment,
            remark: this.remark
          }
          rechargeByCard(_data).then(res => {
            this.loading = !1
            if (res.code == 0) {
              this.currentTab = 2
            } else {
              this.$message.error(res.msg)
            }
          })
          break
        case 'money':
          const _datas = {
            shopId: this.shopId,
            money: this.money,
            userNumber: this.userId,
            paymentWay: this.payment,
            remark: this.remark
          }
          rechargeByMoney(_datas).then(res => {
            this.loading = !1
            if (res.code == 0) {
              this.currentTab = 2
            } else {
              this.$message.error(res.msg)
            }
          })
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>
.recharge-content {
  margin-top: 30px;
}
.recharge-footer {
  position: fixed;
  left: 256px;
  bottom: 0;
  right: 0;
  -webkit-box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.03);
  box-shadow: 0 -1px 2px rgba(0, 0, 0, 0.03);
  background: #fff;
  border-top: 1px solid #e8e8e8;
  padding: 0 24px;
  z-index: 9;

  .operation-container {
    padding: 24px 0;
    text-align: center;
  }
}
</style>
