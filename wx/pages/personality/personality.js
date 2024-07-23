const app = getApp();

Page({
  data: {
    currentPage: 'welcome', //用于切换界面
    currentQuestion:[], //当前的问题
    currentQuestionIndex: 0, //当前的问题序号
    mbtiResult: '', //测试结果
    answeredQuestions: [], // 存储已回答的问题和答案的数组
    currentAnswer: "", // 当前问题的答案
    EISNFTJP: [0,0,0,0,0,0,0,0], // 用于计分，分别对应EISNFTJP
    record: "",
    questions: [], //问题
    character: "", //性格
    job: "", //职业
    major: "", //专业
  },

  //下拉刷新函数
  onPullDownRefresh: function () {
    // 自动调用停止下拉刷新
    wx.stopPullDownRefresh();
  },

  onLoad: function (options) {
    const url = '/findUser';
    const data = {}
    const header = {
      'token': wx.getStorageSync('token')
    }
    app.request(url,data,header).then( res=>{
      this.setData({
        record: res.mbti
      })
    })

    const url2 = '/personalityAll';
    app.request(url2,data,header).then( res=>{
      this.setData({
        questions: res
      })
    })
  },

  startTest() {
    this.setData({
      currentPage: 'question',
      currentQuestionIndex: 0,
      answeredQuestions: [],
      currentAnswer: "",
      mbtiResult: '',
      EISNFTJP: [0,0,0,0,0,0,0,0],
      currentQuestion: this.data.questions[0]
    });
    // console.log(this.data.questions)
  },

  onTipShow() {
    var that = this;
    wx.showModal({
        title: '提示',
        content: '确认要退出测试吗？',
        success: function (res) {
            if (res.confirm) {
                that.setData({
                  currentPage: 'welcome'
                })
            } else if (res.cancel) {
              return;
            }
          }
        }
    )
  },

  toWelcome() {
    this.setData({
      currentPage: 'welcome',
      currentQuestion: this.data.questions[0],
      currentAnswer: "",
      tipShow: false
    });
  },

  lookRecord() {
    if (this.data.record === "") {
        wx.showToast({
            title: '暂无测试记录',
            icon: 'none',
            duration: 1000
        })
        return;
    }
    this.setData({
      currentPage: 'record',
      mbtiResult: this.data.record,
    });
    this.getMbti();
  },
  
  selectAnswer(event) {
    const selectedAnswer = event.currentTarget.dataset.option;
    const{ answeredQuestions } = this.data;
    const { currentQuestionIndex,questions } = this.data;

    answeredQuestions[this.data.currentQuestionIndex] = {
        id: this.data.currentQuestion.id,
        selectAnswer: selectedAnswer
    }

    this.setData({
        answeredQuestions: answeredQuestions
    })

    if (currentQuestionIndex < questions.length - 1) { // 显示下一个问题
      this.setData({
        currentQuestionIndex: currentQuestionIndex + 1,
        currentQuestion: questions[this.data.currentQuestionIndex + 1],
        currentAnswer: this.data.answeredQuestions[this.data.currentQuestionIndex].selectAnswer
      });

      if(currentQuestionIndex < answeredQuestions.length-1){
        this.setData({
          currentAnswer: this.data.answeredQuestions[this.data.currentQuestionIndex].selectAnswer
        });
      } else {
        this.setData({
          currentAnswer: ""
        });
      }

    } else { // 用户回答完所有问题，计算MBTI结果并跳转到结果页面
      const mbtiResult = this.calculateMBTIResult();
      const url = '/updateUser';
      const data = {
        'mbti' : mbtiResult
      }
      const header = {
        'token': wx.getStorageSync('token')
      }
      app.request(url,data,header,'POST').then( res=>{
        this.setData({
          record: res.mbti
        })
      })
      this.setData({
        currentPage: 'result',
        mbtiResult: mbtiResult,
        record: mbtiResult,
        currentQuestion:[],
        currentQuestionIndex: 0,
      });
      this.getMbti();
    }
  },
  
  calculateMBTIResult() {
    const { answeredQuestions } = this.data;
    for (let i = 0; i < answeredQuestions.length; i++) {
      let selectedAnswer = answeredQuestions[i].selectAnswer;
      let option = 0;
      if (selectedAnswer === "B") option = 1;
      this.judgeType(this.data.questions[i].score[option]);
    } //返回题号+选项对应的EISNFTJP
    if (this.data.EISNFTJP[0] > this.data.EISNFTJP[1]) this.data.mbtiResult += "E";
      else this.data.mbtiResult += "I";
    if (this.data.EISNFTJP[2] > this.data.EISNFTJP[3]) this.data.mbtiResult += "S";
      else this.data.mbtiResult += "N";
    if (this.data.EISNFTJP[4] > this.data.EISNFTJP[5]) this.data.mbtiResult += "F";
      else this.data.mbtiResult += "T";
    if (this.data.EISNFTJP[6] > this.data.EISNFTJP[7]) this.data.mbtiResult += "J";
      else this.data.mbtiResult += "P";
    return this.data.mbtiResult;
  },

  judgeType(type){
    let EISNFTJP = this.data.EISNFTJP;
    switch (type) { //计分
      case "E": EISNFTJP[0]++; break;
      case "I": EISNFTJP[1]++; break;
      case "S": EISNFTJP[2]++; break;
      case "N": EISNFTJP[3]++; break;
      case "F": EISNFTJP[4]++; break;
      case "T": EISNFTJP[5]++; break;
      case "J": EISNFTJP[6]++; break;
      case "P": EISNFTJP[7]++; break;
    }
    this.setData({
        EISNFTJP: EISNFTJP
    })
  },

  goBack() {
    if (this.data.currentQuestionIndex > 0) {
      // 返回上一题
      this.setData({
        currentQuestionIndex: this.data.currentQuestionIndex - 1,
        currentQuestion: this.data.questions[this.data.currentQuestionIndex - 1],
        currentAnswer: this.data.answeredQuestions[this.data.currentQuestionIndex-1].selectAnswer
      });
    }
  },

  getMbti() {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    const url = '/mbti';
    const data = {
      'personality' : this.data.mbtiResult
    }
    const header = {
      'token': wx.getStorageSync('token')
    }
    app.request(url,data,header).then( res=>{
      this.setData({
        job: res[0].job,
        character: res[0].character
      })
      wx.hideLoading();
    })

    const url2 = '/perMajor';
    const data2 = {
      'personality' : this.data.mbtiResult
    }
    app.request(url2,data2,header).then( res=>{
      this.setData({
        major: res
      })
      wx.hideLoading();
    })
  },

});
