import { axios } from '@/utils/request'

/**
 * 文件上传
 */
export const uploadFile = '/gateway/basic/file/upload'
export const importFile = '/gateway/commodityStocks/uploadCommodityStocks'
export const importShopGoodsFile = '/gateway/goods/uploadgoods/shop'

export const getSmsCode = (mobile) => axios.get('operation/forgetPasswordSmsSend/' + mobile)

// 获取省份
export const getProvince = () => axios.get('basic/region/province/select')

// 获取城市
export const getCity = (id) => axios.get('basic/region/city/select/' + id)

/**
 * 统计分析
 */
// 获取统计分析数据
export const getFaceDataPreview = () => axios.get('shop/statistics/operationAnalysis')

// 获取统计分析数据
export const getBarDataPreview = (paramObj) => axios.get('shop/statistics/operationAnalysis/chart/' + paramObj.type + '/' + paramObj.time)

/**
 * 广告位
 */
// 添加广告位
export const addAd = (paramObj) => axios.post('Advertising/add', paramObj)

// 分页查询广告位
export const getAdList = (paramObj) => axios.post('Advertising/list', paramObj)

// 查询广告位
export const getAdInfo = (id) => axios.get('Advertising/info/' + id)

// 修改广告位
export const modifyAd = (paramObj) => axios.put('Advertising/modify', paramObj)

// 删除广告位
export const removeAd = (ids) => axios.delete('Advertising/deleted/' + ids)

// 启用广告位
export const enabledAd = (ids) => axios.put('Advertising/startAdvertising/' + ids)

// 禁用广告位
export const disabledAd = (ids) => axios.put('Advertising/stopAdvertising/' + ids)

// 广告分组
// 分页查询广告位
export const getAllAdvertGroup = (paramObj) => axios.get('/advertGroup/getList', paramObj)

/**
 * 商品库
 */
// 获取商品分类
export const getGoodsCategory = () => axios.post('commodityCategory/queryAll')

// 批量导入商品
export const importCsvGoods = (paramObj) => axios.post('commodityStocks/uploadCommodityStocks', paramObj)

// 添加商品
export const addGoods = (paramObj) => axios.post('commodityStocks/add', paramObj)

// 分页查询商品
export const getGoodsList = (paramObj) => axios.post('commodityStocks/list', paramObj)

// 查询商品
export const getGoodsInfo = (id) => axios.get('commodityStocks/info/' + id)

// 修改商品
export const modifyGoods = (paramObj) => axios.put('commodityStocks/modify', paramObj)

// 批量删除商品
export const deletedGoods = (ids) => axios.delete('commodityStocks/deleted/' + ids)

/**
 * 商户
 */
// 添加商户
export const addMerchant = (paramObj) => axios.post('merchant/addMerchantModel', paramObj)

// 查询商户
export const getMerchantInfo = (id) => axios.get('merchant/info/' + id)

// 修改商户
export const editMerchant = (paramObj) => axios.put('merchant/modify', paramObj)

// 获取所有商户
export const getMerchantList = (paramObj) => axios.post('merchant/list', paramObj)

/**
 * 店铺
 */
// 新增
export const addShop = (paramObj) => axios.post('shop/addShop', paramObj)

// 店铺详情
export const getShopInfo = (id) => axios.get('shop/getShopInfo/' + id)

// 分页查询店铺
export const getShopList = (paramObj) => axios.post('shop/list', paramObj)

// 修改代理商
export const modifyShop = (paramObj) => axios.post('shop/modify', paramObj)

// 启用店铺
export const enabledShop = (id) => axios.put('shop/startShop/' + id)

// 禁用店铺
export const disabledShop = (paramObj) => axios.put('shop/stopShop', paramObj)

/**
 * 会员等级规则
 */
// 添加会员等级规则
export const addMemberLvRule = (paramObj) => axios.post('membershipRule/add', paramObj)

// 获取会员等级规则信息
export const getMemberLvRuleInfo = (id) => axios.get('membershipRule/info/' + id)

// 获取会员等级规则列表
export const getMemberLvRuleData = (paramObj) => axios.post('membershipRule/queryPage', paramObj)

// 修改会员等级规则
export const modifyMemberLvRule = (paramObj) => axios.post('membershipRule/modify', paramObj)

/**
 * 店铺会员
 */
// 获取店铺会员列表
export const getMemberData = (paramObj) => axios.post('shopCustomer/getShopCustomerPage', paramObj)

// 获取会员等级规则信息
export const getMemberInfo = (id) => axios.get('shopCustomer/info/' + id)

// 导出生日将近7天的店铺店员
export const exportShopClerk = (id) => axios.get('shopCustomer/birthdayRange/stocks/' + id, { responseType: 'blob' })

// 新增店铺店员
export const addShopClerk = (paramObj) => axios.put('shopClerk/add/' + paramObj.shopId + '/' + paramObj.roleCode + '/' + paramObj.ids)

// 获取角色list
export const getRoleList = () => axios.get('common/getRoleList')

/**
 * 店铺店员
 */
// 获取店铺店员信息
export const getShopClerkInfo = (id) => axios.get('shopClerk/info/' + id)

// 获取店铺店员列表
export const getShopClerkData = (paramObj) => axios.post('shopClerk/getShopClerkPage', paramObj)

// 修改店铺店员
export const modifyShopClerk = (paramObj) => axios.put('shopClerk/modify', paramObj)

// 取消店铺店员
export const removeShopClerk = (ids) => axios.delete('shopClerk/deleted/' + ids)

// 禁用店铺店员
export const enOrDisabledShopClerk = (paramObj) => axios.put('shopClerk/forbidden/' + paramObj.state + '/' + paramObj.ids)

// 设置店员在APP端登陆账号密码
export const setShopClerkAccount = (paramObj) => axios.put('shopClerk/insertOrUpdate/' + paramObj.id + '/' + paramObj.account + '/' + paramObj.password)

/**
 * 充值卡相关
 */
// 添加店铺充值卡
export const addRechargeCard = (paramObj) => axios.post('rechargeCard/add', paramObj)

// 获取充值卡列表
export const getRechargeCardData = (paramObj) => axios.post('rechargeCard/list', paramObj)

// 查询详情
export const getRechargeCardInfo = (id) => axios.get('rechargeCard/info/' + id)

// 删除充值卡
export const removeRechargeCard = (ids) => axios.delete('rechargeCard/deleted/' + ids)

// 禁用充值卡
export const enOrDisabledRechargeCard = (paramObj) => axios.put('rechargeCard/forbidden/' + paramObj.state + '/' + paramObj.ids)

// 获取店铺所有储值卡
export const getRechargeCardDatas = (id) => axios.get('rechargeCard/all/list/' + id)

// 充值通过储值卡
export const rechargeByCard = (paramObj) => axios.post('rechargeCard/charge/rechargeCard', paramObj)

// 充值通过自定义金额
export const rechargeByMoney = (paramObj) => axios.post('rechargeCard/charge/custom', paramObj)

/**
 * 订单记录
 */
// 订单记录列表
export const getOrderRecordData = (paramObj) => axios.post('consume/list', paramObj)

/**
 * 平台商品类目
 */
// 添加类目
export const addPlatformGCategory = (paramObj) => axios.post('virtualGoods/category/add', paramObj)

// 分页查询
export const getPlatformGCategoryList = (paramObj) => axios.post('virtualGoods/category/pageQuery', paramObj)

// 查询详情
export const getPlatformGCategoryInfo = (id) => axios.get('virtualGoods/category/info/' + id)

// 编辑分类
export const modifyPlatformGCategory = (paramObj) => axios.put('virtualGoods/category/modify', paramObj)

// 删除分类
export const removePlatformGCategory = (id) => axios.delete('virtualGoods/category/delete/' + id)

// 查询
export const getPlatformGCategoryAll = (paramObj) => axios.post('virtualGoods/category/query', paramObj)

// 启用or禁用
export const setPlatformGCategoryState = (paramObj) => axios.put('virtualGoods/category/modifyState/' + paramObj.state + '/' + paramObj.idArr)

/**
 * 平台商品
 */
// 新增虚拟商品
export const addPlatformVirtualGoods = (paramObj) => axios.post('virtualGoods/add', paramObj)

// 新增实物商品
export const addPlatformEntityGoods = (paramObj) => axios.post('physicalGoods/add', paramObj)

// 分页查询
export const getPlatformGoodsList = (paramObj) => axios.post('virtualGoods/pageQuery', paramObj)

// 修改
export const modifyPlatformGoods = (paramObj) => axios.put('virtualGoods/modify', paramObj)

// 删除
export const removePlatformGoods = (id) => axios.delete('virtualGoods/delete/' + id)

// 详情
export const getPlatformGoodsInfo = (id) => axios.get('virtualGoods/info/' + id)

// 上下架
export const setPlatformGoodsIsMarketable = (paramObj) => axios.put('virtualGoods/modifyIsMarketable/' + paramObj.state + '/' + paramObj.idArr)

/**
 * 平台虚拟商品
 */
//  传虚拟商品对账单
export const importVirtualFile = '/gateway/virtualGoods/sellRecord/statementOfAccount'

// 分页查询
export const getVirtualSellRecordList = (paramObj) => axios.post('virtualGoods/sellRecord/pageQuery', paramObj)

/**
 * 商品导入
 */
// 获取能导入的商品
export const getCanImprotGoods = (paramObj) => axios.post('commodityStocks/goods/list', paramObj)

// 获取已经导入的商品
export const getCanImportedGoods = (paramObj) => axios.post('commodityStocks/inputGoods/list', paramObj)

// 获取分类（分类至）
export const getShopCategory = (id) => axios.get('commodityStocks/list/' + id)

// 确认导入商品
export const submitImportGoods = (paramObj) => axios.put('commodityStocks/import/' + paramObj.shopId + '/' + paramObj.categoryId + '/' + paramObj.gids)

/**
 * 拼团商品
 */
// 添加拼团商品
export const addPlatformGroupGoods = (paramObj) => axios.post('goodsGroup/add', paramObj)

// 获取拼团商品信息
export const getPlatformGroupGoodsInfo = (id) => axios.get('goodsGroup/info/' + id)

// 修改拼团商品
export const modifyPlatformGroupGoods = (paramObj) => axios.put('goodsGroup/modify', paramObj)

// 删除拼团商品
export const removePlatformGroupGoods = (ids) => axios.put('goodsGroup/delete/' + ids)

// 获取拼团商品列表
export const getPlatformGroupGoodsList = (paramObj) => axios.post('goodsGroup/list', paramObj)

// 获取商品拼团列表
export const getPlatformGroupList = (paramObj) => axios.post('orderGroup/page', paramObj)

/**
 * 秒杀商品
 */
// 添加秒杀商品
export const addPlatformSeckillGoods = (paramObj) => axios.post('goodsSeckill/add', paramObj)

// 获取秒杀商品信息
export const getPlatformSeckillGoodsInfo = (id) => axios.get('goodsSeckill/info/' + id)

// 修改秒杀商品
export const modifyPlatformSeckillGoods = (paramObj) => axios.put('goodsSeckill/modify', paramObj)

// 删除秒杀商品
export const removePlatformSeckillGoods = (ids) => axios.put('goodsSeckill/delete/' + ids)

// 获取秒杀商品列表
export const getPlatformSeckillGoodsList = (paramObj) => axios.post('goodsSeckill/list', paramObj)
