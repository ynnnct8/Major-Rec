const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp()

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    nickname: "微信用户",
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },

  inputConfirm(event){
    let nickname = event.detail.value
    this.setData({
      nickname: nickname
    })
  },

  confirm() {
    this.login();
  },

  login() {
    wx.showLoading({
        title: '登录中...',
        time: 5000,
    })
    const { avatarUrl, nickname } = this.data;
    wx.login({
      success (res) {
        const url = '/login'
        if (res.code) {
          const data = {
            code: res.code,
          }
          //发起网络请求
          app.request(url, data)
              .then(result => {
                // 将登录用户信息存入缓存
                wx.setStorageSync('token', result); // 在这里处理返回的数据
                // 获取用户信息
                app.getUserInfo();
                // 跳转到用户页面
                wx.reLaunch({
                  url: '/pages/user/user?avatarUrl=' + avatarUrl + "&nickname=" + nickname,
                })
                wx.hideLoading()
              })
              .catch(error => {
                console.error('请求出错：', error); // 在这里处理请求失败的情况
              });
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
})