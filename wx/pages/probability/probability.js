const app = getApp();

Page({
    data: {
        province: '',
        subjectsFirst: '',
        ranking: '',
        school: '',
        probability: '',
        major: '',
        majors: {},
        isShow: false
    },

    //下拉刷新函数
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },

    onInputSchool: function (e) {
        this.setData({
            school: e.detail.value
        })
    },

    onInputRanking: function (e) {
        this.setData({
            ranking: e.detail.value
        })
    },

    submit: function (e) {
        const province = this.data.province;
        const subjectsFirst = this.data.subjectsFirst;
        const ranking = this.data.ranking;
        const school = this.data.school;
        console.log(province, subjectsFirst, ranking, school);
        if (province=== '' || subjectsFirst === '' || ranking === '' || school === '') {
            wx.showToast({
                title: '请填写完整信息',
                icon: 'none',
                duration: 2000
            })
        } else {
            this.getData();
        }
    },

    calculateProbability() {
        let predictedRanking = this.data.majors.rank24;
        if (predictedRanking === '' || predictedRanking === null) {
            predictedRanking = this.data.majors.rank22;
        }
        let yourRanking = this.data.ranking;
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
        probability = probability.toFixed(2);
        this.setData({
            probability: probability
        })
    },

    getData(){
        const url = '/getScoreMinRank';
        const data = {
            school: this.data.school,
            subjectsFirst: this.data.subjectsFirst
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url, data, header).then(res => {
            this.setData({
                majors: res,
                major: res.major,
                isShow: true
            })
            this.calculateProbability();
        })
    },

    //页面加载时触发的事件
    onLoad: function (options) {
        console.log(options);
        const province = options.province;
        const subjectsFirst = options.subjectsFirst;
        this.setData({
            province: province,
            subjectsFirst: subjectsFirst
        })
    }
})
