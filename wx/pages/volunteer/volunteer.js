var app = getApp();
Page({
    data: {
        majors: [],
        ranking: '',
        score: ''
    },

    onPullDownRefresh: function () {
        // 自动调用停止下拉刷新
        wx.stopPullDownRefresh();
    },

    onDetail(event) {
        const major = event.currentTarget.dataset.major;
        const school = event.currentTarget.dataset.school;
        const probability = event.currentTarget.dataset.probability;
        console.log(event);
        wx.navigateTo({
            url: '/pages/recDetail/recDetail'
                + '?major=' + major
                + '&school='+school
                + '&probability='+probability
        })
    },

    onLoad(options) {
        this.setData({
            ranking: options.ranking,
            score: options.score
        })
        this.getMajors();
    },

    calculateProbability(predictedRanking) {
        if (predictedRanking === '' || predictedRanking === null) {
            return '';
        }else {
            const yourRanking = this.data.ranking;
            let probability = '';
            if (predictedRanking>yourRanking) { // 到达预测排名
                probability = (predictedRanking/yourRanking)/2 * 100;
            }else if (predictedRanking===yourRanking) {
                probability = 50.00;

            }else { // 排名不够
                probability = (predictedRanking / yourRanking)/2 * 100;
            }

            if (probability > 100) {
                probability = 99.99;
            }
            return probability.toFixed(2);
        }
    },

    getMajors() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const url = '/findUserVolunteer'
        const data = {}
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url,data,header).then((res) => {
            const newMajors = res.map(major => ({
                    ...major,
                    probability: this.calculateProbability(major.rank24)
                })
            );
            this.setData({
                majors: newMajors
            })
            wx.hideLoading();
        })
    },

    deleteTable(event) {
        const id = event.currentTarget.dataset.id;
        wx.showModal({
            title: '提示',
            content: '确定要删除该志愿吗？',
            success: (res) => {
                if (res.confirm) {
                    this.deleteMajor(id);
                } else if (res.cancel) {
                    return;
                }
            }
        })
    },

    deleteMajor(id) {
        const url = '/deleteUserVolunteer'
        const data = {
            id: id
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url,data,header).then((res) => {
            wx.showToast({
                title: '已移除',
                icon: 'none',
                duration: 1000
            })
            this.getMajors();
        })
    }
})