var app = getApp();
const ip = app.globalData.ip
const port = app.globalData.port

Page({
    data: {
        major: '',
        level: '',
        introduction: '',
        course: '',
        employmentDirection: '',
        universities: [],
        option: '2020',
    },

    //下拉刷新函数
    onPullDownRefresh: function () {
        // 自动调用停止下拉刷新
        wx.stopPullDownRefresh();
    },

    onLoad(options) {
        // 接收参数
        this.setData({
            major: options.major,
            level: options.level
        })
        if (this.data.level === '本科') {
            this.setData({
                level: 1
            })
        }
        if (this.data.level === '专科') {
            this.setData({
                level: 2
            })
        }
        this.getUniversitiesByMajor();
        this.getMajorDetail();
    },

    getUniversitiesByMajor: function () {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const major = this.data.major;
        const url = '/getRankByMajor';
        const data = {
            major: major
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url,data,header).then(result => {
            this.setData({
                universities: result
            })
            wx.hideLoading();
        })
    },

    getMajorDetail: function () {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const major = this.data.major;
        const level = this.data.level;
        let url = '/getMajorsBySecondSubject';
        const data = {
            level: level,
            secondSubject: major
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url,data,header).then(result => {
            this.setData({
                introduction: result[0].introduction,
                course: result[0].course,
                employmentDirection: result[0].employmentDirection
            })
            wx.hideLoading();
        })
    },

    sortByRanking: function (event) {
        const option = event.currentTarget.dataset.option;
        this.setData({
            option: option
        })
        var universities = this.data.universities;
        var sortPattern = this.data.option;
        if (sortPattern === "2020") {
            universities.sort(function (a, b) {
                if (a.rank20 === 0 || a.rank20 == null)
                    return 1;
                if (b.rank20 === 0 || b.rank20 == null)
                    return -1;
                return a.rank20 - b.rank20;
            });
            this.setData({
                universities: universities
            })
        } else if (sortPattern === "2021") {
            universities.sort(function (a, b) {
                if (a.rank21 === 0 || a.rank21 == null)
                    return 1;
                if (b.rank21 === 0 || b.rank21 == null)
                    return -1;
                return a.rank21 - b.rank21;
            });
            this.setData({
                universities: universities
            })
        } else if (sortPattern === "2022") {
            universities.sort(function (a, b) {
                if (a.rank22 === 0 || a.rank22 == null)
                    return 1;
                if (b.rank22 === 0 || b.rank22 == null)
                    return -1;
                return a.rank22 - b.rank22;
            });
            this.setData({
                universities: universities
            })
        } else if (sortPattern === "2023") {
            universities.sort(function (a, b) {
                if (a.rank23 === 0 || a.rank23 == null)
                    return 1;
                if (b.rank23 === 0 || b.rank23 == null)
                    return -1;
                return a.rank23 - b.rank23;
            });
            this.setData({
                universities: universities
            })
        } else if (sortPattern === "2024") {
            universities.sort(function (a, b) {
                if (a.rank24 === 0 || a.rank24 == null)
                    return 1;
                if (b.rank24 === 0 || b.rank24 == null)
                    return -1;
                return a.rank24 - b.rank24;
            });
            this.setData({
                universities: universities
            })
        }
    }
})