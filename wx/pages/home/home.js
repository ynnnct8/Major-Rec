import { areaList } from '@vant/area-data';
const app = getApp();

Page({
  data: {
    areaList,
    selectedProvince: '',
    score: '',
    ranking: '',
    selectedSubjects1: '', //首选科目
    selectedSubjects2: [], //次选科目
    subjects1: ['物理', '历史'],
    subjects2: ['化学', '生物', '地理', '政治'],
    functions: [
      { name: '查大学', iconUrl: '../../image/universitySearch.png', url: '/pages/universitySearch/universitySearch' },
      { name: '查专业', iconUrl: '../../image/major.png', url: '/pages/majorSearch/majorSearch' },
      { name: '志愿表', iconUrl: '../../image/table.png', url: '/pages/volunteer/volunteer' },
      { name: 'MBTI测试', iconUrl: '../../image/mbti.png', url: '/pages/personality/personality' },
      { name: '测概率', iconUrl: '../../image/p.png', url: '/pages/probability/probability'},
    ],
    //调用弹出框
    provinceShow: false, 
    subjectShow1: false,
    subjectShow2: false,
    arrowdirection: "", //箭头方向
    arrowdirection1: "", //箭头方向
    arrowdirection2: "", //箭头方向
  },

    //下拉刷新函数
    onPullDownRefresh: function () {
        // 重新获取用户信息
        this.onLoad();
        wx.showToast({
            title: '刷新成功',
            icon: 'success',
            duration: 1000
        });
        // 自动调用停止下拉刷新
        wx.stopPullDownRefresh();
    },

    onShow() {
      if (wx.getStorageSync('token') === '' || wx.getStorageSync('token') === null){
          wx.showModal({
            title: '提示',
            content: '请先登录',
            showCancel: false,
            success (res) {
                if (res.confirm) {
                    wx.switchTab({
                    url: '/pages/user/user'
                    })
                }
            }
          })
      }
    },
    
    onLoad() {
        if(wx.getStorageSync('token') !== ''){
            const userInfo = wx.getStorageSync('userInfo');
            this.setData({
                score: userInfo.mark,
                ranking: userInfo.ranking,
                selectedProvince: userInfo.province,
                selectedSubjects1: userInfo.firstSubject,
                selectedSubjects2: [userInfo.secondSubject, userInfo.thirdSubject]
            })
        }
    },

    onGridItemClick: function (event) {
      // 判断是否完善个人信息
        if (this.data.score === '' || this.data.score === null
        || this.data.ranking === '' || this.data.ranking === null
        || this.data.selectedProvince === '' || this.data.selectedProvince === null
        || this.data.selectedSubjects1 === '' || this.data.selectedSubjects1 === null
        || this.data.selectedSubjects2 === '' || this.data.selectedSubjects2 === null
        || this.data.selectedSubjects2.length !== 2) {
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
            return;
        }
        const index = event.currentTarget.dataset.index;
        var url = this.data.functions[index].url;
        if (index === 2) {
            url = url + '?ranking=' + this.data.ranking + '&score=' + this.data.score;
        }
        if (index === 4) {
            url = url + '?province=' + this.data.selectedProvince + '&subjectsFirst=' + this.data.selectedSubjects1;
        }
        wx.navigateTo({
            url: url
        });
    },

    //省份选择
    onProvinceChange: function(event) {
        this.setData({
          provinceShow : true,
          arrowdirection: "down"
        })
    },
    onProvinceClose(){
        this.setData({
          provinceShow : false,
          arrowdirection: ""
        })
    },
    onConfirm: function(event) {
        this.setData({
            selectedProvince: event.detail.values[0].name,
            arrowdirection: "",
            provinceShow : false
        });
    },

    //选科选择
    onSubjectChange1: function(event) {
      if(this.data.subjectShow1===false){
          this.setData({
              subjectShow1 : true,
              arrowdirection1: "down"
          })
      }
      else if(this.data.subjectShow1===true){
          this.setData({
              subjectShow1 : false,
              arrowdirection1: ""
          })
      }
    },
    onChange1(event) {
        this.setData({
          selectedSubjects1: event.detail,
          arrowdirection1: "",
        });
        if(this.data.selectedSubjects1.length === 1){
          this.setData({
            subjectShow1 : false
          })
        }
    },
    onSubjectChange2: function(event) {
        if(this.data.subjectShow2===false){
            this.setData({
                subjectShow2 : true,
                arrowdirection2: "down"
            })
        }
        else if(this.data.subjectShow2===true){
            this.setData({
                subjectShow2 : false,
                arrowdirection2: ""
            })
        }
    },
    onChange2(event) {
        this.setData({
          selectedSubjects2: event.detail,
          arrowdirection2: "",
        });
        if(this.data.selectedSubjects2.length === 2){
          this.setData({
            subjectShow2 : false
          })
        }
    },

    //排名输入
    onRankingInput: function (event) {
        const ranking = event.detail
        console.log(ranking);
        this.setData({
            ranking: ranking,
        });
    },

    //分数输入
    onScoreInput: function (event) {
        const score = event.detail;
        console.log(score);
        this.setData({
            score: score,
        });
    },

    //保存
    saveData: function (event) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        const score = this.data.score;
        const ranking = this.data.ranking;
        const selectedProvince = this.data.selectedProvince;
        const selectedSubjects1 = this.data.selectedSubjects1[0];
        const selectedSubjects2 = this.data.selectedSubjects2[0];
        const selectedSubjects3 = this.data.selectedSubjects2[1];
        console.log(score, ranking, selectedProvince, selectedSubjects1, selectedSubjects2, selectedSubjects3);
        if (score!=='' && ranking!=='' && selectedProvince!==''
            && selectedSubjects1!=='' && selectedSubjects2!==''
            && selectedSubjects3!=='') {
            const url = '/updateUser';
            const data = {
                mark: score,
                ranking: ranking,
                province: selectedProvince,
                firstSubject: selectedSubjects1,
                secondSubject: selectedSubjects2,
                thirdSubject: selectedSubjects3
            }
            const header = {
                'token': wx.getStorageSync('token')
            }
            app.request(url, data, header, 'POST')
                .then((res) => {
                    app.getUserInfo();
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success',
                        duration: 1000
                    })
                })
                .catch((err) => {
                    wx.showToast({
                        title: '请求失败',
                        icon: 'none',
                        duration: 1000
                    });
                })
        }
        else{
            wx.showToast({
                title: '请填写完整信息',
                duration: 1000
            });
        }
    },
});
