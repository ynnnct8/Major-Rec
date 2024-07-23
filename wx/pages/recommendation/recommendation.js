import { areaList } from '@vant/area-data';
import {promisifyAll} from "miniprogram-api-promise";
const app = getApp();

Page({
    data: {
        firstSubject: '',
        mbti: '',
        ranking: 0,
        province: '',
        option: '1',
        majors: [],
        cityShow: false,
        typeShow: false,
        types: ['全部', '本科', '专科'],
        selectedProvince: '全部',
        selectedCity: '全部',
        selectedType: '全部',
        loadResults: [],
        areaList: areaList,
        page: 1, // 当前页数
        isLastPage: false, // 是否最后一页
    },

    //下拉刷新函数
    onPullDownRefresh: function () {
        // 自动调用停止下拉刷新
        this.setData({
            page: 1,
            majors: [],
            loadResults: [],
            isLastPage: false
        })
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        this.onLoad();
        wx.stopPullDownRefresh();
    },

    onReachBottom: function () {
        if (!this.data.isLastPage) { // 如果还有下一页数据
            this.getRecommendation()
        } else {
            wx.showToast({
                title: '没有更多数据了',
                icon: 'none'
            });
        }
    },

    onLoad(options) {
        let areaList = this.data.areaList;
        areaList.province_list[100000] = '全部';
        for (let i in areaList.province_list) {
            let code = parseInt(i)+99;
            areaList.city_list[code] = '全部';
        }
        this.setData({
            areaList: areaList
        })
        if(wx.getStorageSync('token') !== ''){
            this.getUserInfo();
        }
    },

    onDetail(event) {
        const major = event.currentTarget.dataset.major;
        const school = event.currentTarget.dataset.school;
        const probability = event.currentTarget.dataset.probability;

        wx.navigateTo({
            url: '/pages/recDetail/recDetail'
                + '?major=' + major
                + '&school='+school
                + '&probability='+probability
        })
    },

    onShow() {
        if (wx.getStorageSync('token') === null || wx.getStorageSync('token') === '') {
            wx.showModal({
                title: '提示',
                content: '请先登录',
                showCancel: false,
                success (res) {
                    if (res.confirm) {
                        wx.switchTab({
                            url: '/pages/user/user',
                        })
                    }
                }
            })
        }
        else {
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo.score === null || userInfo.score === ''
                || userInfo.ranking === null || userInfo.ranking === ''
                || userInfo.firstSubject === null || userInfo.firstSubject === ''
                || userInfo.secondSubject === null || userInfo.secondSubject === ''
                || userInfo.thirdSubject === null || userInfo.thirdSubject === ''
            ) {
                wx.showModal({
                    title: '提示',
                    content: '请先完善个人信息',
                    showCancel: false,
                    success (res) {
                        if (res.confirm) {
                            wx.switchTab({
                                url: '/pages/home/home',
                            })
                        }
                    }
                })
            }
        }
    },

    joinTable(event) {
        const major = event.currentTarget.dataset.major;
        const school = event.currentTarget.dataset.school;
        const rank24 = event.currentTarget.dataset.rank24;
        const rank22 = event.currentTarget.dataset.rank22;
        let rank = rank24;
        if (rank24 === null || rank24 === '') {
            rank = rank22;
        }
        const url = '/addUserVolunteer';
        const data = {
            school: school,
            major: major,
            rank24: rank
        };
        const header = {
            'token': wx.getStorageSync('token')
        }
        wx.request({
            url: app.globalData.url + url,
            data: data,
            header: header,
            method: 'POST',
            success (res) {
                console.log(res);
                if (res.data.code === 1) {
                    wx.showToast({
                        title: '添加成功',
                        icon: 'success',
                        duration: 1000
                    });
                } else if (res.data.code === 0) {
                    wx.showToast({
                        title: '请勿重复添加',
                        icon: 'none',
                        duration: 1000
                    });
                } else {
                    wx.showToast({
                        title: '服务器错误',
                        duration: 1000
                    });
                }
            },
            fail (res) {
                wx.showToast({
                    title: '请求失败',
                    duration: 1000
                });
            }
        })
    },

    // 确定冲稳保筛选
    optionChange(event) {
        const option = event.currentTarget.dataset.option;
        this.setData({
            option: option,
            page: 1,
            majors: [],
            loadResults: [],
            isLastPage: false
        })
        // console.log(option);
        this.getRecommendation();
    },

    // 确定院校城市筛选
    onCityChange(event) {
        this.setData({
            page: 1,
            majors: [],
            loadResults: [],
            isLastPage: false
        })
        this.getRecommendation();
    },

    // 确定院校类型筛选
    onTypeChange(event) {
        this.setData({
            page: 1,
            majors: [],
            loadResults: [],
            isLastPage: false
        })
        this.getRecommendation();
    },

    getUserInfo() {
        const userInfo = wx.getStorageSync('userInfo');
        this.setData({
            firstSubject: userInfo.firstSubject,
            secondSubject: userInfo.secondSubject,
            thirdSubject: userInfo.thirdSubject,
            ranking: userInfo.ranking,
            mbti: userInfo.mbti
        })
        this.getRecommendation();
    },

    calculateProbability(predictedRanking,rank22) {
        if (predictedRanking === null || predictedRanking === '') {
            predictedRanking = rank22;
        }
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
    },

    getRecommendation(){
        const subjectsFirst = this.data.firstSubject;
        const ranking = this.data.ranking;
        const mbti = this.data.mbti;

        let province =this.data.selectedProvince;
        if (province === '全部'){
            province = '';
        }         let city = this.data.selectedCity;
        if (city === '全部'){
            city = '';
        }
        let type = this.data.selectedType+'批';
        if (type === '全部批'){
            type = '';
        }
        const url = '/getScore'
        const data = {
            current: this.data.page,
            size: 10,
            subjectsFirst: subjectsFirst,
            province: province,
            city: city,
            batch: type,
            mbti: mbti,
            ranking: ranking,
            option: this.data.option
        }
        const header = {
            'token': wx.getStorageSync('token')
        }
        wx.request({
            url: app.globalData.url + url,
            data: data,
            header: header,
            method: 'GET',
            success: (res) => {
                if (res.data.code === 1) {
                    const oldMajors = this.data.majors;
                    const newMajors = oldMajors.concat(
                        res.data.data.list.map(major => ({
                            ...major,
                            probability: this.calculateProbability(major.rank24,major.rank22)
                        }))
                    );
                    let filteredMajors = [];
                    if (this.data.option === '1') {
                        filteredMajors = newMajors.filter(major =>
                            major.probability >= 20
                            && major.probability < 50
                        );
                    } else if (this.data.option === '2') {
                        filteredMajors = newMajors.filter(major =>
                            major.probability >= 50
                            && major.probability < 90
                        );
                    } else if (this.data.option === '3') {
                        filteredMajors = newMajors.filter(major =>
                            major.probability >= 90
                        );
                    }

                    this.setData({
                        majors: filteredMajors,
                        loadResults: filteredMajors,
                        totalNum: res.data.data.total,
                        page: res.data.data.current + 1
                    });
                }
                else if(res.data.code === 0){
                    this.setData({
                        isLastPage: true
                    })
                    wx.showToast({
                        title: '没有更多数据了',
                        icon: 'none',
                        time: 1000
                    });
                } else{
                    wx.showToast({
                        title: '未找到数据',
                        duration: 1000,
                        time: 1000
                    });
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '请求失败',
                    duration: 1000,
                    time: 1000
                });
            }
        })
    },

    onCityShow() {
        this.setData({ cityShow: true });
    },
    onTypeShow() {
        this.setData({ typeShow: true });
    },
    onCityClose() {
        this.setData({ cityShow: false });
    },
    onTypeClose() {
        this.setData({ typeShow: false });
    },

    // 监听院校城市筛选变化
    onCityConfirm(event) {
        const { values } = event.detail;
        this.setData({
            cityShow: false,
            selectedProvince: values[0].name,
            selectedCity: values[1].name
        });
        this.onCityChange();
    },

    // 监听院校类型筛选变化
    onTypeConfirm(event) {
        const { value } = event.detail;
        this.setData({
            typeShow: false,
            selectedType: value
        });
        this.onTypeChange();
    },
});