// activity/dailyPunch/index/index.js
let app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    punchList: [],
    autoplay: false,
    duration: 2001,
    current: 0,
    isLogin: false
  },
  onLoad(options) {
    if (wx.getStorageSync('token')) {
      wx.showLoading({
        title: '加载中'
      })
    }
  },
  onShow() {
    if (!wx.getStorageSync('token')) {
      this.setData({
        isLogin: false
      })
      this.getPunchCards()
    } else {
      this.checkToken()
    }
  },
  checkToken() {
    let postData = {
      url: '/accountCenter/account/miniApp/validation/token',
      data: {
        token: wx.getStorageSync('token') || app.globalData.userInfo.token
      }
    }
    app.ajax(postData).then(res => {
      if (res.success) {
        this.setData({
          isLogin: true
        })
      } else {
        this.setData({
          isLogin: false
        })
        wx.removeStorageSync('jwtToken')
        wx.removeStorageSync('token')
        wx.hideLoading()
      }
      this.getPunchCards()
    }).catch(e => {
      console.log(e)
      wx.hideLoading()
    })
  },
  currentHandle(e) {
    let {
      current
    } = e.detail
    this.setData({
      current
    })
  },
  toPunchdetail(e) {
    let index = e.currentTarget.id
    let id = this.data.punchList[index].cardPunchVO.id
    let pageUrl = this.data.punchList[index].cardPunchVO.pageUrl
    wx.navigateTo({
      url: `/${pageUrl}?cardPunchId=${id}`
    })
  },

  getPunchCards() {
    let postData = {
      url: `/activityCenter/punchCard/cards`,
      data: {
        pageNum: 1,
        pageSize: 20,
        token: wx.getStorageSync('token') || ''
      }
    }
    app.ajax(postData).then(res => {
      wx.hideLoading()
      if (res.success) {
        this.setData({
          punchList: res.data || []
        })
      } else {}
    }).catch(e => {
      console.log(e)
      wx.hideLoading()
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    // 「有人@你」{{nickname}}邀请您一起参与{{title}}
    let punchInfo = this.data.punchList[this.data.current]
    let imageUrl = punchInfo.cardPunchVO.shareUrl
    let name = wx.getStorageSync('userName')
    let mainTitle = punchInfo.cardPunchVO.mainTitle
    if (mainTitle.indexOf(',') > -1) {
      mainTitle = mainTitle.split(',').join('')
    } else {
      mainTitle = mainTitle.split('，').join('')
    }
    let shareTitle = punchInfo.cardPunchVO.shareTitle
    let title = shareTitle.replace('{{nickname}}', name)
    title = title.replace('{{title}}', mainTitle)
    return {
      imageUrl,
      title,
      path: `/punch/dailyPunch/index/index`
    }
  },
  test() {
    let game = name => {
      console.log('name', name)
    }
    game('dsd')
  }
})
