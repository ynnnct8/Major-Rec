const app = getApp();

Page({
    data: {
        currentPage: 'sort',
        levels: ['本科', '专科'],
        level: '本科',
        firsts1: ['工学', '理学','医学', '文学', '历史学', '哲学', '农学', '管理学', '艺术学'],
        firsts2: ['农林牧渔大类','资源环境与安全大类','能源动力与材料大类','土木建筑大类','水利大类',
            '装备制造大类','生物与化工大类','轻工纺织大类','食品药品与粮食大类','交通运输大类',
            '电子与信息大类','医药卫生大类','财经商贸大类','旅游大类', '文化艺术大类','新闻传播大类',
            '教育与体育大类','公安与司法大类','公共管理与服务大类'],
        first: '工学',
        seconds: [],
        second: "计算机类",
        majors: [],
        searchResults: [],
        keyword:"",
    },
    onLoad() {
        this.getFirstMajors(0);
    },

    //下拉刷新函数
    onPullDownRefresh: function () {
        // 自动调用停止下拉刷新
        wx.stopPullDownRefresh();
    },

    bindChange(e) {
        const val = e.detail.value;
        this.setData({
            level: this.data.levels[val[0]],
        })
        if (this.data.level==='本科') {
            this.setData({
                first: this.data.firsts1[val[1]],
            })
        }
        else {
            this.setData({
                first: this.data.firsts2[val[1]],
            })
        }
        this.getFirstMajors(val[2]);
    },

    toSort() {
        this.setData({
            currentPage: 'sort',
        })
    },

    toSearch() {
        this.setData({
            currentPage: 'search',
        })
    },

    clearKeyword(){
        this.setData({
            searchResults: ""
        })
    },

    // 监听搜索框输入事件，确定搜索关键词
    onInputChange(event) {
        const keyword = event.detail;
            this.setData({
                keyword: keyword,
            });
        if (this.data.keyword!=="") {
            this.getSearchMajors();
        }
        else {
            this.setData({
                searchResults: ""
            })
        }
    },

    // 监听搜索按钮点击事件，点击搜索
    onSearch() {
        const keyword = this.data.keyword;
        if(keyword!==""){
            this.getSearchMajors();
        }
    },

    getFirstMajors(n){
        let level = 1
        if (this.data.level === '本科') { level = 1 }
        else { level = 2 }
        const url = '/majorFirst';
        const data = {
            level: level,
            category: this.data.first
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url, data, header, 'GET').then(res => {
            this.setData({
                seconds: res,
                second: res[n],
            })
            this.getMajors();
        })
    },

    getMajors: function () {
        var level = 1
        if (this.data.level === '本科') { level = 1 }
        else { level = 2 }
        const url = '/majorSecond';
        const data = {
            level: level,
            category: this.data.first,
            firstSubject: this.data.second
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url, data, header, 'GET').then(res => {
            this.setData({
                majors: res
            })
        })
    },

    // 搜索
    getSearchMajors: function () {
        const keyword = this.data.keyword;
        const url = '/majors'
        const data = {
            secondSubject: keyword
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        app.request(url, data, header, 'GET').then(res => {
            this.setData({
                searchResults: res
            })
        })
    }
});