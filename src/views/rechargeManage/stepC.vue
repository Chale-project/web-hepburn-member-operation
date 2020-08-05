<template>
  <a-card :bordered="false" style="margin: -24px -24px 0px;">
    <result type="success" :description="description" :title="title"></result>
  </a-card>

</template>

<script>
import { Result } from '@/components'
export default {
  name: 'stepC',
  components: {
    Result
  },
  data() {
    return {
      title: '充值成功',
      description: '您已为随选会员成功储值，\n' + ' 请在客户小程序“个人中心”面板刷新后查看已充值的金额。\n'
    }
  },
  methods: {}
}
</script>
