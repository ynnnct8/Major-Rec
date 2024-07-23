const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
      avatarUrl: defaultAvatarUrl,
      nickname: "微信用户",
      token: "",
  },

    //下拉刷新函数
    onPullDownRefresh: function () {
        // 自动调用停止下拉刷新
        wx.stopPullDownRefresh();
    },

  //页面加载时触发的事件
  onLoad: function (options) {
    if(wx.getStorageSync('token') != null) {
        this.setData({
            avatarUrl: options.avatarUrl,
            nickname: options.nickname,
            token: wx.getStorageSync('token')
        })
    }
  },

  login(){
    wx.navigateTo({
        url: '/pages/login/login',
    })
  },

  onLogout(){
    var that = this;
    if(wx.getStorageSync('token') === null){
        wx.showToast({
            title: '您还未登录',
            icon: 'none',
            duration: 2000
        })
        return
    }
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success (res) {
        if (res.confirm) {
          that.setData({
            avatarUrl: defaultAvatarUrl,
            nickname: "",
            token: ""
          })
          //清除缓存
          wx.clearStorage()

        } else if (res.cancel) {
            return;
        }
      }
    })
  }
})
