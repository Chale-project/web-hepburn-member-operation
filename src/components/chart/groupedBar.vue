<template>
  <div :style="{ padding: '0 24px 32px 24px' }">
    <div class="data-full" v-if="data.length>0">
      <h4 :style="{ marginBottom: '20px' }">{{ title }}</h4>
      <v-chart height="254" :data="data" :forceFit="true" :padding="['auto', 'auto', '20', '50']">
        <v-legend dataKey="item" position="top-right" />
        <v-tooltip />
        <v-axis />
        <v-bar position="key*value" color="item" :adjust="adjust" />
      </v-chart>
    </div>
    <div class="data-empty" v-else>暂无数据</div>
  </div>
</template>

<script>
export default {
  name: 'groupedBar',
  props: {
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      adjust: [
        {
          type: 'dodge',
          marginRatio: 2 / 32
        }
      ]
    }
  }
}
</script>

<style lang="less">
.data-empty {
  padding: 150px 24px;
  text-align: center;
}
</style>