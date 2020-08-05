<template>
  <div class="page-statistics-content">
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loadingA" title="总消费金额" :total="`￥${faceData.businessVolume/100||'0.00'}`">
          <a-tooltip title="消费金额" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="" style="margin-right: 16px;"><span slot="term">昨日</span>￥{{faceData.yesterdayBv|formatMoney}}</trend>
            <trend flag=""><span slot="term">7日</span>￥{{faceData.weekBv|formatMoney}}</trend>
          </div>
          <template slot="footer">今日消费金额<span>￥{{faceData.todayBv|formatMoney}}</span></template>
        </chart-card>
      </a-col>

      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loadingA" title="总支付笔数" :total="`${faceData.transactionNum}`||'0'">
          <a-tooltip title="支付笔数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="" style="margin-right: 16px;"><span slot="term">昨日</span>{{faceData.yesterdayTn||'0'}}</trend>
            <trend flag=""><span slot="term">7日</span>{{faceData.weekTn||'0'}}</trend>
          </div>
          <template slot="footer">今日支付笔数<span>{{faceData.todayTn||'0'}}</span></template>
        </chart-card>
      </a-col>

      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loadingA" title="总充值金额" :total="`￥${faceData.rechargeMoney/100||'0.00'}`">
          <a-tooltip title="充值金额" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="" style="margin-right: 16px;"><span slot="term">昨日</span>￥{{faceData.yesterdayRm|formatMoney}}</trend>
            <trend flag=""><span slot="term">7日</span>￥{{faceData.weekRm|formatMoney}}</trend>
          </div>
          <template slot="footer">今日充值金额<span>￥{{faceData.todayRm|formatMoney}}</span></template>
        </chart-card>
      </a-col>

      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loadingA" title="总赠送金额" :total="`￥${faceData.presentMoney/100||'0.00'}`">
          <a-tooltip title="赠送金额" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="" style="margin-right: 16px;"><span slot="term">昨日</span>￥{{faceData.yesterdayPm|formatMoney}}</trend>
            <trend flag=""><span slot="term">7日</span>￥{{faceData.weekPm|formatMoney}}</trend>
          </div>
          <template slot="footer">今日赠送金额<span>￥{{faceData.todayPm|formatMoney}}</span></template>
        </chart-card>
      </a-col>
    </a-row>

    <a-card :loading="loadingB" :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <a-tabs :activeKey="dataType" size="large" :tab-bar-style="{paddingLeft: '16px'}" @change="checkDataTypeQuick">
          <div class="extra-wrapper" slot="tabBarExtraContent">
            <div class="extra-item">
              <a-tabs :activeKey="dataTime" @change="checkDateTimeQuick" :tabBarStyle="{margin:'0'}" :tabBarGutter="0">
                <a-tab-pane :tab="v.value" :key="v.key" v-for="v in extraData"></a-tab-pane>
              </a-tabs>
            </div>
          </div>
          <a-tab-pane tab="销售额" key="businessVolume">
            <a-row>
              <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
                <grouped-bar :data="barDataA" title="销售额对比" />
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane tab="支付笔数" key="transaction">
            <a-row>
              <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
                <grouped-bar :data="barDataB" title="支付笔数总览" />
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane tab="会员" key="membership">
            <a-row>
              <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
                <grouped-bar :data="barDataC" title="会员总览" />
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane tab="积分" key="integral">
            <a-row>
              <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
                <grouped-bar :data="barDataD" title="积分总览" />
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>

  </div>
</template>

<script>
import { getFaceDataPreview, getBarDataPreview } from '@/api/common'
import { ChartCard, groupedBar, Trend } from '@/components'
import { mixinDevice } from '@/utils/mixin'

export default {
  name: 'Analysis',
  mixins: [mixinDevice],
  components: {
    ChartCard,
    groupedBar,
    Trend
  },
  data() {
    return {
      loadingA: true,
      loadingB: true,
      dataType: 'businessVolume', // businessVolume：销售额；transaction：支付笔数；membership：会员；integral：积分；
      extraData: [
        { key: 'today', value: '今日' },
        { key: 'yesterday', value: '昨日' },
        { key: 'week', value: '本周' },
        { key: 'month', value: '本月' },
        { key: 'year', value: '本年度' }
      ],
      dataTime: 'today',

      faceData: {}, // 面板数据

      barDataA: [],
      barDataB: [],
      barDataC: [],
      barDataD: []
    }
  },

  methods: {
    // 数据类型标签快捷选择
    checkDataTypeQuick(e) {
      this.dataType = e
      this.getBarDatas()
    },

    // 时间标签快捷选择
    checkDateTimeQuick(e) {
      this.dataTime = e
      this.getBarDatas()
    },

    // 获取数据概览
    getDataPreview() {
      getFaceDataPreview().then(res => {
        this.loadingA = false
        if (res.code == 0) {
          const _info = res.result
          _info.transactionNum = _info.transactionNum.toString()
          this.faceData = _info
        } else {
          this.$message.error(res.msg)
        }
      })
    },

    // 获取barDatas
    getBarDatas() {
      const data = {
        type: this.dataType,
        time: this.dataTime
      }
      getBarDataPreview(data).then(res => {
        this.loadingB = false
        if (res.code == 0) {
          const dataList = res.result
          switch (this.dataType) {
            case 'businessVolume':
              this.barDataA = dataList
              break
            case 'transaction':
              this.barDataB = dataList
              break
            case 'membership':
              this.barDataC = dataList
              break
            case 'integral':
              this.barDataD = dataList
              break
          }
        } else {
          this.$message.error(res.msg)
        }
      })

      // setTimeout(() => {
      //   this.loading = !this.loading
      //   const _barDataC = []
      //   const _barDataD = []
      //   for (let i = 0; i < 12; i += 1) {
      //     _barDataC.push(
      //       {
      //         item: `消费会员数`,
      //         key: `${i + 1}月`,
      //         value: Math.floor(Math.random() * 1000) + 200
      //       },
      //       {
      //         item: `新增会员数`,
      //         key: `${i + 1}月`,
      //         value: Math.floor(Math.random() * 1000) + 100
      //       }
      //     )
      //     _barDataD.push(
      //       {
      //         item: `消费积分`,
      //         key: `${i + 1}月`,
      //         value: Math.floor(Math.random() * 1000) + 200
      //       },
      //       {
      //         item: `赠送积分`,
      //         key: `${i + 1}月`,
      //         value: Math.floor(Math.random() * 1000) + 100
      //       }
      //     )
      //   }
      //   this.barDataC = _barDataC
      //   this.barDataD = _barDataD
      // }, 1000)
    }
  },

  created() {
    this.getDataPreview()
    this.getBarDatas()
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-tabs.ant-tabs-top.ant-tabs-line .ant-tabs-extra-content {
  line-height: normal;
}
.extra-wrapper {
  padding-right: 24px;
  .extra-item {
    display: inline-block;
    margin-right: 24px;
    /deep/ .ant-tabs.ant-tabs-top.ant-tabs-line .ant-tabs-bar .ant-tabs-nav-container {
      font-size: 14px;
    }
  }
}
.antd-pro-pages-dashboard-analysis-twoColLayout {
  position: relative;
  display: flex;
  display: block;
  flex-flow: row wrap;

  &.desktop div[class^='ant-col']:last-child {
    position: absolute;
    right: 0;
    height: 100%;
  }
}

.antd-pro-pages-dashboard-analysis-salesCard {
  height: calc(100% - 24px);
  /deep/ .ant-card-head {
    position: relative;
  }
}

.dashboard-analysis-iconGroup {
  i {
    margin-left: 16px;
    color: rgba(0, 0, 0, 0.45);
    cursor: pointer;
    transition: color 0.32s;
    color: black;
  }
}
.analysis-salesTypeRadio {
  position: absolute;
  right: 54px;
  bottom: 12px;
}
</style>
