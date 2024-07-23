const app = getApp();

Page({
    data: {
        school: "",
        province: "",
        city: "",
        level: "",
        message: "",
        image: "",
        majors: [],
    },

    //下拉刷新函数
    onPullDownRefresh: function () {
        // 自动调用停止下拉刷新
        wx.stopPullDownRefresh();
    },

    onLoad: function(options) {
        // 获取上一个页面传递的参数
        const school = options.school;
        this.setData({
            school: school
        });
        this.getSchoolDetail();
        this.getMajorBySchool();
    },

    getMajorBySchool: function () {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const url = '/getMajorBySchool?school';
        const data = {
            school: this.data.school
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url, data, header).then(res => {
            this.setData({
                majors: res
            })
            wx.hideLoading();
        })
    },

    getSchoolDetail: function () {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        let url = '/getSchoolMessageBySchool';
        const data = {
            school: this.data.school
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url, data, header).then(res => {
            this.setData({
                province: res.province,
                city: res.city,
                level: res.level,
                message: res.message,
                image: res.image
            })
            wx.hideLoading();
        })
    },

});
