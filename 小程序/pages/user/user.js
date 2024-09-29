Page({
  data: {
    pic: '/images/touxiang.png',
    name: '用户名称',
    showButton: true, // 默认显示按钮
  },

  getuser: function(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          name: res.userInfo.nickName,
          pic: res.userInfo.avatarUrl,
          showButton: false, // 成功获取用户信息后隐藏按钮
        })
      }
    })
  },

  showMessage:function() {
    wx.showModal({
      title: '提示',
      content: '感谢您使用我们的产品，有任何问题请联系我们！',
      showCancel: false
    });
  }
})