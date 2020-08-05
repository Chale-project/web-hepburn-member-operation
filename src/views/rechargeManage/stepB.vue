<template>
  <div>

    <!-- step two -->
    <a-card title="选择会员" :bordered="false">
      <div class="step-page-recharge-type">
        <a-radio-group v-model="rechargeType" buttonStyle="solid" @change="onChangeRechargeType">
          <a-radio-button value="rechargeCard">充值卡充值</a-radio-button>
          <a-radio-button value="money">自定义金额充值</a-radio-button>
        </a-radio-group>
        <a-divider />
      </div>

      <div class="step-page-recharge-content">
        <div class="recharge-card" v-if="rechargeType=='rechargeCard'">
          <a-row type="flex" align="middle" :gutter="{ xs: 8, sm: 16, md: 24}" v-if="rechargeCardList.length>0">
            <a-col :sm="12" :md="8" :lg="6" v-for="(v,i) of rechargeCardList" :key="i" :style="{paddingTop:'12px',paddingBottom:'12px'}">
              <div :class="v.checked?'card-item checked':'card-item'" @click="checkRechargeCard(i)">
                <div class="card-face-value">￥{{v.cardMoney/100}}</div>
                <div class="card-description">{{v.presentMoney>0?' 送'+v.presentMoney/100+'元余额':''}}{{v.presentIntegral>0?' 送'+v.presentIntegral+'积分':''}}</div>
              </div>
            </a-col>
          </a-row>
          <div class="recharge-card-empty" v-else>
            <div class="empty-icon">
              <a-icon type="folder-open" :style="{fontSize:'32px'}" />
            </div>
            <div class="empty-desc">店铺还未添加可用的储值卡！请选择其他储值方式或<a @click="navigateTo">去添加</a></div>
          </div>
        </div>
        <div class="recharge-card" v-else-if="rechargeType=='money'">
          <a-form>
            <a-row type="flex" justify="center" :gutter="24">
              <a-col :md="16" :sm="16">
                <a-form-item label="充值金额" :required="true">
                  <a-input type="number" v-model="inputMoney" size="large" addonBefore="￥" addonAfter="元" placeholder="请填写充值金额" @change="onChangeMoney" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <div class="recharge-paymentType">
          <a-form>
            <a-row type="flex" justify="center" :gutter="24">
              <a-col :md="16" :sm="16">
                <a-form-item label="付款方式" required>
                  <a-radio-group v-model="paymentType" @change="onChangePaymentType">
                    <a-radio value="weixin">微信</a-radio>
                    <a-radio value="alipay">支付宝</a-radio>
                    <a-radio value="bank">银行卡转账</a-radio>
                    <a-radio value="POS">POS机刷卡</a-radio>
                    <a-radio value="cash">现金</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

        <div class="recharge-remark">
          <a-form>
            <a-row type="flex" justify="center" :gutter="24">
              <a-col :md="16" :sm="16">
                <a-form-item label="备注说明">
                  <a-input v-model="remark" size="large" placeholder="请填写备注说明" @change="onChangeRemark" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>

      </div>

    </a-card>

  </div>
</template>

<script>
import { getRechargeCardDatas } from '@/api/common'

export default {
  name: 'stepB',
  props: {
    shopId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      rechargeType: 'rechargeCard', // 充值方式：money：自定义任意金额；rechargeCard：充值卡充值
      rechargeCardList: [],
      checkedCardId: null,
      inputMoney: null,
      paymentType: null,
      remark: null
    }
  },

  methods: {
    // 导航到储值卡添加页面
    navigateTo() {
      this.$router.push({ name: 'rechargeCard' })
    },

    //切换充值方式
    onChangeRechargeType(e) {
      const _type = e.target.value
      this.rechargeType = _type
      this.$emit('type', _type)
      if (_type == 'rechargeCard') {
        this.inputMoney = null
      } else if (_type == 'money') {
        this.checkedCardId = null
        const _cardList = this.rechargeCardList
        if (_cardList.length > 0) {
          _cardList.map(i => {
            if (i.checked) i.checked = !1
          })
        }
      }
      this.$emit('cardId', this.checkedCardId)
      this.$emit('money', this.inputMoney)
    },

    // 点选充值卡
    checkRechargeCard(i) {
      this.inputMoney = null
      const _rechargeCardList = this.rechargeCardList
      _rechargeCardList.map((item, index) => {
        if (index == i) {
          item.checked = !0
          this.checkedCardId = item.id
          this.$emit('cardId', item.id)
        } else {
          item.checked = !1
        }
      })
    },

    // 自定义充值金额
    onChangeMoney(e) {
      this.$emit('money', this.inputMoney)
    },

    // 支付方式
    onChangePaymentType() {
      this.$emit('payment', this.paymentType)
    },

    // 备注
    onChangeRemark() {
      this.$emit('remark', this.remark)
    },

    // 获取储值卡数据列表
    getRechargeCardList() {
      getRechargeCardDatas(this.shopId)
        .then(res => {
          if (res.code == 0) {
            let _cardList = res.list
            if (_cardList.length > 0) {
              _cardList.map(i => {
                i.checked = !1
              })
              this.rechargeCardList = _cardList
            } else {
              this.rechargeCardList = []
            }
          } else {
            this.$message.error(res.msg)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  created() {
    this.$emit('type', this.rechargeType)
    this.getRechargeCardList()
  }
}
</script>

<style lang="less" scoped>
.step-page-recharge-type {
  margin-bottom: 20px;
  text-align: center;
}
.step-page-recharge-content {
  .card-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 125px;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
    text-align: center;
    overflow: hidden;
    cursor: pointer;
    .card-face-value {
      padding: 5px 0;
      font-size: 20px;
      font-weight: 700;
    }
    .card-description {
      padding: 5px 0;
      display: -webkit-box;
      overflow: hidden;
      white-space: normal !important;
      text-overflow: ellipsis;
      word-wrap: break-word;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      color: #999;
    }
  }
  .card-item.checked {
    border-color: #1890ff;
  }

  .recharge-card-empty {
    padding: 50px 0;
    text-align: center;
    .empty-icon,
    .empty-desc {
      padding: 10px;
    }
  }

  .recharge-paymentType{
    margin-top: 24px;
  }
}
</style>