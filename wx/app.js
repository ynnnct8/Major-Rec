// 导入 promise 化的小程序 API
import { promisifyAll } from 'miniprogram-api-promise';

// 使用 promisifyAll 将 wx 对象下的所有 API promise 化，并保存到 wxp 中
const wxp = {};
promisifyAll(wx, wxp);

App({
    // 全局数据
    globalData: {
        ip: '127.0.0.1',
        port: '8080',
        url: 'http://127.0.0.1:8080'
    },

    // 封装请求方法
    request(url, data, header = {}, method = 'GET') {
        return wxp.request({
            url: this.globalData.url+url,
            data: data,
            header: header,
            method: method,
        }).then(res => {
            // console.log('请求结果：', res);
            const { code, data } = res.data;
            if (code === 1) {
                console.log('请求成功：', data);
                return data; // 返回接口成功时的数据部分
            } else {
                console.error('请求失败：', res.data);
                throw new Error(`请求失败：${res.data.msg || '未知错误'}`);
            }
        }).catch(error => {
            console.error('请求失败：', error);
            throw error; // 继续抛出错误，以便在调用方进行处理
        });
    },

    // 获取用户信息并更新缓存
    getUserInfo() {
        // 获取缓存
        const token = wx.getStorageSync('token')
        const url = '/findUser'
        const header = {
            'token': token
        }
        // 发起网络请求
        this.request(url,"",header,"GET")
            .then(result => {
                // 更新用户信息缓存
                wx.setStorageSync('userInfo', result);
            })
            .catch(error => {
                console.error('请求出错：', error);
            });
    },

    // 小程序初始化时执行的操作
    onLaunch() {

    },

});
