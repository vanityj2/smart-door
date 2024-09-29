import mqtt from'../../utils/mqtt.js';
const aliyunOpt = require('../../utils/aliyun/aliyun_connect.js');
const app = getApp()
let that = null;

Page({
  data: {
    isPasswordInputVisible: false, // 控制密码输入框的显示与隐藏
    isPasswordInputFocused: false, // 控制密码输入框的聚焦状态
    password: '', // 用于保存用户输入的密码
    correctPassword: '123456', // 设置正确的密码
    door_state:0,  //判断门的状态值0为关，1为开
    unlock_id:0,
    client: null,
    Temp:0,
    Hum:0,
    Light:0,
    LED:false,
    Beep:false,
    client:null,//记录重连的次数
      reconnectCounts:0,//MQTT连接的配置
      options:{
        protocolVersion: 4, //MQTT连接协议版本
        clean: false,
        reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
        connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
        resubscribe: true, //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
        clientId: '',
        password: '',
        username: '',
      },
      aliyunInfo: {
        productKey: 'k0h2e9gLrJX',
        deviceName: 'WECHATDUAN',
        deviceSecret: 'f83501f3c8cc9adf8eb43b839f0a4fbf',
        regionId: 'cn-shanghai',
        pubTopic: '/k0h2e9gLrJX/WECHATDUAN/user/WECHATDUAN',//发布消息的主题
        subTopic: ' /k0h2e9gLrJX/WECHATDUAN/user/get' //订阅消息的主题
      },
  },
 
  onShow() {
 
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let clientOpt = aliyunOpt.getAliyunIotMqttClient({
      productKey: that.data.aliyunInfo.productKey,
      deviceName: that.data.aliyunInfo.deviceName,
      deviceSecret: that.data.aliyunInfo.deviceSecret,
      regionId: that.data.aliyunInfo.regionId,
      port: that.data.aliyunInfo.port,
    });

    console.log("get data:" + JSON.stringify(clientOpt));
    let host = 'wxs://' + clientOpt.host;
    
    this.setData({
      'options.clientId': clientOpt.clientId,
      'options.password': clientOpt.password,
      'options.username': clientOpt.username,
    })
    console.log("this.data.options host:" + host);
    console.log("this.data.options data:" + JSON.stringify(this.data.options));

    //访问服务器
    this.data.client = mqtt.connect(host, this.data.options);

    this.data.client.on('connect', function (connack) {
      wx.showToast({
        title: '连接成功'
      })
      console.log("连接成功");
    })

    //接收消息监听
    that.data.client.on("message", function (topic, payload) {
      //message是一个16进制的字节流
      let dataFromALY = {};
      try {
        dataFromALY = JSON.parse(payload);
        console.log(dataFromALY.params);
       that.setData({
        //转换成JSON格式的数据进行读取
       door_state:dataFromALY.params.door_state,
       unlock_id:dataFromALY.params.unlock_id,
      })
      
          // 判断unlock_id是否等于111，如果是则触发指纹解锁成功的逻辑
          if (dataFromALY.params.unlock_id === 111 && dataFromALY.params.door_state ===1) {
            wx.showToast({
              title: '人脸解锁成功',
              // icon: 'none',
              image:'/images/face.png',
              mask:true,
              duration: 3000,
            });
          }else if (dataFromALY.params.unlock_id >= 0 && dataFromALY.params.unlock_id <= 3 && dataFromALY.params.door_state ===1) {
            wx.showToast({
                title: '指纹解锁成功',
                // icon: 'none',
                image:'/images/zhiwen.png',
                mask:true,
                duration: 3000,
            });
        }else if (dataFromALY.params.unlock_id >= 10 && dataFromALY.params.unlock_id <= 13 && dataFromALY.params.door_state ===1) {
          wx.showToast({
              title: '刷卡解锁成功',
              // icon: 'none',
              image:'/images/card.png',
              mask:true,
              duration: 3000,
          });
      }

      } catch (error) {
        console.log(error);
      }
    })

    //服务器连接异常的回调
    that.data.client.on("error", function (error) {
      console.log(" 服务器 error 的回调" + error)

    })
    //服务器重连连接异常的回调
    that.data.client.on("reconnect", function () {
      console.log(" 服务器 reconnect的回调")

    })
    //服务器连接异常的回调
    that.data.client.on("offline", function (errr) {
      console.log(" 服务器offline的回调")
    })
  },


  
  //点击开发送数据1
  onClickOpen() {
    that.sendCommond(1);
  },
  //点击关发送数据0
  onClickOff() {
    that.sendCommond(0);
  },

  // 切换状态，改变状态显示
  onClickChange() {
    const newdoorState = this.data.door_state === 0 ? 1 : 0;
    this.setData({
      door_state: newdoorState,
  }, () => {
      this.sendCommond(newdoorState);
  });
  },
  
  sendCommond(data) {
    let sendData = {
      params: {
        door_state: data,
      }
    };
    //发布消息
    if (this.data.client && this.data.client.connected) {
      this.data.client.publish(this.data.aliyunInfo.pubTopic, JSON.stringify(sendData));
      console.log(this.data.aliyunInfo.pubTopic)
      console.log(JSON.stringify(sendData))
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },

//指纹识别
  startFingerprintAuthentication() {
    wx.checkIsSupportSoterAuthentication({
      success(res) {
        if (res.supportMode.includes('fingerPrint')) {
          // 支持指纹识别，调用指纹识别接口
          wx.startSoterAuthentication({
            requestAuthModes: ['fingerPrint'],
            challenge: 'challenge', // 这里可以自定义一个挑战值
            success(res) {
              if (res.errCode === 0) {
                // 指纹验证成功，执行解锁操作
                console.log('指纹验证成功');
                // 在这里可以执行解锁操作
                that.onClickChange()
                setTimeout(() => {
                  that.onClickChange();
                }, 3000); 
              } else {
                // 指纹验证失败
                console.log('指纹验证失败');
              }
            },
            fail() {
              // 指纹验证取消或失败
              console.log('指纹验证取消或失败');
            }
          });
        } else {
          // 设备不支持指纹识别
          console.log('设备不支持指纹识别');
        }
      }
    });
  },

  showPasswordInput: function() {
    // 点击卡片时触发的函数，用于显示密码输入框并聚焦
    this.setData({
      isPasswordInputVisible: true,
      isPasswordInputFocused: true
    });
  },

  inputChange: function(e) {
    // 监听输入框内容变化
    this.setData({
      password: e.detail.value
    });
  },

  checkPassword: function() {
    // 点击确认按钮时触发的函数，用于验证密码是否正确
    if (this.data.password === this.data.correctPassword) {
      wx.showToast({
        title: '密码解锁成功',
        icon: 'success',
        duration: 2000
      });
      // 在这里可以执行解锁成功后的操作
      that.onClickChange()
      setTimeout(() => {
        that.onClickChange();
      }, 3000); 
    } else {
      wx.showToast({
        title: '密码错误',
        icon: 'none',
        duration: 2000
      });
    }
    // 隐藏密码输入框
    this.setData({
      isPasswordInputVisible: false,
      isPasswordInputFocused: false,
      password: '' // 清空密码输入框
    });
  },
})

