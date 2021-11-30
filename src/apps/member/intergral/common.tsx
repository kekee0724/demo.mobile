export const tabs1 = [
    { title: "赚积分", sub: "1" },
    { title: "花积分", sub: "2" }
];
export const tabs2 = [
    { title: "赚积分", sub: "1" },
    { title: "花积分", sub: "2" },
    { title: "积分记录", sub: "3" }
];

export const colorArr = ["#1c93ff", "#16b6cb", "#ffae17", "#ff1111", "#1d98ff", "#46b6eb", "#6ffe17", "#ff1eee", "#7fbb17", "#fceffe"];
export const option = {
    tooltip: {
        trigger: "item",
        formatter: "{b} : {c} ({d}%)",
        position: ["50%", "35%"]
    },
    labelLine: {
        normal: {
            show: false
        }
    },
    color: ["#1c93ff", "#16b6cb", "#ffae17", "#ff1111"],
    series: [
        {
            name: "类别",
            type: "pie",
            radius: ["60%", "75%"],
            center: ["50%", "50%"],
            label: {
                normal: {
                    show: false,
                    position: "center"
                }
            },
            data: [
                { value: 50, name: "园区工单" },
                { value: 30, name: "资源预订" },
                { value: 20, name: "评价互动" },
                { value: 10, name: "系统充值" }
            ],
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)"
                }
            }
        }
    ]
};
export const option2 = {
  title: {
    text: '13',
    subtext: 'DAY',
    x: 'center',
    y: 'center',
    textStyle: {
      fontWeight: 'normal',
      color: 'rgba(255, 153, 51, 1)',
      fontSize: '21',
    },
    subtextStyle: {
      color: 'rgba(111, 111, 111, 1)',
      fontSize: '10',
    },
  },

  color: ['rgba(242, 242, 242, 1)'],

  series: [
    {
      type: 'pie',
      clockWise: true,
      radius: ['80%', '90%'],
      itemStyle: {
        normal: {
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
        },
      },
      hoverAnimation: false,
      data: [
        {
          value: 40,
          name: '01',
          itemStyle: {
            normal: {
              color: 'rgba(255, 153, 51, 1)',
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
            },
          },
        },
        {
          name: '02',
          value: 20,
        },
      ],
    },
    {
      type: 'pie',
      clockWise: true,
      radius: ['0', '70%'],
      itemStyle: {
        normal: {
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
        },
      },
      hoverAnimation: false,
      data: [
        {
          value: 1,
          name: '01',
          itemStyle: {
            normal: {
              color: 'rgba(242, 242, 242, 1)',
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
            },
          },
        },
      ],
    },
  ],
};
/**
 * 积分使用方式
 */
export enum RuleTypeEnum {
    /**
     * 赚积分
     */
    earn = 0,
    /**
     * 花积分
     */
    expend = 1
}
/**
 * 积分类型
 */
export enum CurrentIntergralTypeEnum {
    /**
     * 个人
     */
    person = 0,
    /**
     * 公司
     */
    company = 1
}

export enum EventNameEnum {
    dailyDheck = "每日签到",
    logIn = "注册登录",
    topic = "发起话题",
    thirdPartySharing = "第三方分享",
    deposit = "平台充值",
    noSign = "报名未签到",
    cancallation = "资源预订取消",
    commentDelete = "评论删除",
    platformDeduction = "平台扣除"
}
