const app = getApp();

Page({
    data: {
        major: '',
        school: '',
        probability: '',
        ranking: '',
        score: '',
        detail: {}
    },

    onLoad(options) {
        const userInfo = wx.getStorageSync('userInfo');
        this.setData({
            major: options.major,
            school: options.school,
            probability: options.probability,
            ranking: userInfo.ranking,
            score: userInfo.mark
        })
        this.getDetail();
    },

    getDetail() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const url = '/getRank';
        const data = {
            school: this.data.school,
            major: this.data.major
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url,data,header).then((res) => {
            this.setData({
                detail: res
            })
            wx.hideLoading();
        })
    }
})