/*!
 * oneSocket.js v0.1.0
 * (c) 2017 Payne Pandaroid Wang
 * 封装对 socket 使用，处理跨父子页面共用 socket 的差异。接收分发协议、被调用发送协议。
 */

//设备类型
var DEVICE_TYPE_LOGIN = 1;
var DEVICE_TYPE_WULI = 2;

//仪器类型
var DEVICE_TYPE_LIULIANG = 1;
var DEVICE_TYPE_IC = 2;
var DEVICE_TYPE_ICLIULIANG = 3;

//设备状态
var DEVICE_STATUS_ZHENGCAHNG = 1;
var DEVICE_STATUS_TINGYONG = 2;
var DEVICE_STATUS_GUZHANG = 3;

//玩家状态
var USER_STATUS_NORMAL = 1;

//角色类型
var ROLE_SYSTEM = "ROLE_SYSTEM";
var ROLE_TENANTADMIN = "ROLE_TENANTADMIN";
var ROLE_TENANT = "ROLE_TENANT";

//告警状态
var GAOJING_INIT = 1;//未处理
var GAOJING_DONE = 2;//已处理
var GAOJING_IGNORE = 3;//忽略


layui.define(['jquery', 'layer', 'element'], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var element = layui.element();

    console.log('【layui.tools】加载完毕后执行回调');
    // Start: 所有的 function
    var LeftNavTabManager = {
        check: {},
        jumpLeftNavTab: function (url) {
            console.log(['jumpLeftNavTab url: ', url].join(''));
            var arr_element_leftNav = $('.layui-side-scroll .layui-nav .layui-nav-item a[data-url]');
            if (!arr_element_leftNav || !arr_element_leftNav.length || !(arr_element_leftNav.length > 0)) {
                if (window && window.parent && (window !== window.parent)
                    && window.parent.layui && window.parent.layui.tools) {
                    window.parent.layui.tools.jumpLeftNavTab(url);
                }
                return;
            }
            //
            var arr_urlAndParamStr = url.split('?');
            var url_pureLeftNav = arr_urlAndParamStr[0];
            //
            for (var i = 0, len = arr_element_leftNav.length; i < len; ++i) {
                var item_element_leftNav = $(arr_element_leftNav[i]);
                var str_dataUrl = item_element_leftNav.data('url');
                if (str_dataUrl == url_pureLeftNav) {
                    // item_element_leftNav.attr('data-url', url);
                    //
                    LeftNavTabManager.check = {
                        dataId: item_element_leftNav.data('id')
                        , dataUrl: url
                    };
                    //
                    item_element_leftNav.trigger('click');
                    // $(arr_element_leftNav[i]).click();
                    // item_element_leftNav.attr('data-url', url_pureLeftNav);
                    break;
                }
            }
        },
        indexLeftNavTopTab: function () {
            var navfilter = 'left-nav';
            var nav = $('.layui-nav[lay-filter=' + navfilter + ']').eq(0);

            var tabfilter = 'top-tab';
            var tab = $('.layui-tab[lay-filter=' + tabfilter + ']').eq(0);
            var tabcontent = tab.children('.layui-tab-content').eq(0);
            var tabtitle = tab.children('.layui-tab-title').eq(0);

            /**
             * iframe自适应
             */
            $(window).resize(function () {
                //设置顶部切换卡容器度
                tabcontent.height($(this).height() - 60 - 41 - 44); //头部高度 顶部切换卡高度 底部高度
                //设置顶部切换卡容器内每个iframe高度
                tabcontent.find('iframe').each(function () {
                    $(this).height(tabcontent.height());
                });
            }).resize();

            /**
             * 监听侧边栏导航点击事件
             */
            element.on('nav(' + navfilter + ')', function (elem) {
                var a = elem.children('a');
                // var title = a.text();
                var title = a.html();
                var src = elem.children('a').attr('data-url');
                var id = elem.children('a').attr('data-id');
                var iframe = tabcontent.find('iframe[data-id=' + id + ']').eq(0);
                var tabindex = tabtitle.children('li').length;

                if (src != undefined && src != null && id != undefined && id != null) {
                    if (iframe.length) { //存在 iframe
                        //获取iframe身上的tab index
                        tabindex = iframe.attr('data-tabindex');
                        //
                        if (id == LeftNavTabManager.check.dataId) {
                            iframe.attr('src', LeftNavTabManager.check.dataUrl);
                            LeftNavTabManager.check = {};
                        }
                    } else { //不存在 iframe
                        //显示加载层
                        layer.load();
                        //
                        if (id == LeftNavTabManager.check.dataId) {
                            src = LeftNavTabManager.check.dataUrl;
                            LeftNavTabManager.check = {};
                        }
                        //拼接iframe
                        var iframe = '<iframe';
                        iframe += ' src="' + src + '" data-id="' + id + '" data-tabindex="' + tabindex + '"';
                        iframe += ' style="width: 100%; height: ' + tabcontent.height() + 'px; border: 0px;"';
                        iframe += '></iframe>';
                        //顶部切换卡新增一个卡片
                        element.tabAdd(tabfilter, {title: title, content: iframe, id: id});
                        layer.closeAll('loading');
                    }

                    //切换到指定索引的卡片
                    element.tabChange(tabfilter, id);
                }
            });

            /**
             * 初始化点击侧边栏第一个导航
             */
            nav.find('li a[data-url]').eq(0).click();

            // Start: 点击按钮收起或展开侧边栏
            $(document).on('click', '#layui-left-menu-toggle', function () {
                // class strings
                var classStr_layuiSideHide = 'layui-side-hide';
                var classStr_layuiBodyOnSideHide = 'layui-body-on-side-hide';
                var classStr_layuiLeftMenuToggleHide = 'layui-left-menu-toggle-hide';
                // dom elements
                var domEle_layuiSideLayuiBgBlack = $('.layui-side.layui-bg-black');
                var domEle_layuiBody = $('.layui-layout-admin .layui-body');
                var domEle_layuiLeftMenuToggle = $('#layui-left-menu-toggle');
                // 具体点击后 toggle
                if (domEle_layuiSideLayuiBgBlack.hasClass(classStr_layuiSideHide)) {
                    domEle_layuiSideLayuiBgBlack.removeClass(classStr_layuiSideHide);
                    domEle_layuiBody.removeClass(classStr_layuiBodyOnSideHide);
                    domEle_layuiLeftMenuToggle.removeClass(classStr_layuiLeftMenuToggleHide);
                } else {
                    domEle_layuiSideLayuiBgBlack.addClass(classStr_layuiSideHide);
                    domEle_layuiBody.addClass(classStr_layuiBodyOnSideHide);
                    domEle_layuiLeftMenuToggle.addClass(classStr_layuiLeftMenuToggleHide);
                }
            });
            // End  : 点击按钮收起或展开侧边栏
        }
    };

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null;
    }

    function deviceid2des(l) {
        if (l == DEVICE_TYPE_LOGIN) {
            return "逻辑设备";
        } else if (l == DEVICE_TYPE_WULI) {
            return "物理设备";
        } else {
            return "其他设备";
        }
    }

    /**
     *  设备的状态 转描述
     * @param s
     * @returns {*}
     */
    function deviceStatus2des(s) {
        if (s == DEVICE_STATUS_ZHENGCAHNG) {
            return "正常";
        } else if (s == DEVICE_STATUS_GUZHANG) {
            return "故障";
        } else if (s == DEVICE_STATUS_TINGYONG) {
            return "停用";
        } else {
            return "未知";
        }
    }

    /**
     * 设备的类型描述
     * @param l
     * @returns {*}
     */
    function deviceType2des(l) {
        if (l == DEVICE_TYPE_LIULIANG) {
            return "流量计";
        } else if (l == DEVICE_TYPE_IC) {
            return "IC";
        } else if (l == DEVICE_TYPE_ICLIULIANG) {
            return "IC&流量计";
        } else {
            return "未知类型";
        }
    }

    //动态渲染select的option
    function renderSelectOption(url, p, key, value, select) {
        $.ajax({
            type: "post",
            url: url,
            data: p,
            async: false,
            success: function (data) {
                //得到数据之后来操作
                console.log("得到的select option的数据:", JSON.stringify(data));
                var op = "<option value='0'>根节点</option>"
                for (var i = 0; i < data.data.length; i++) {
                    op += "<option value=" + data.data[i][key] + ">" + data.data[i][value] + "</option>"
                }
                console.log("开始渲染html:" + op);
                select.html(op);
            }
        });
    }

    function dateFtt(fmt, date) { //author: meizz
        var o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    //时间戳 显示成时间
    function timestampToString(tm) {
        //如果是空的情况
        if (tm == undefined || tm == null || tm == 0) {
            return ""
        }
        var d = new Date(parseInt(tm));
        return dateFtt("yyyy-MM-dd hh:mm:ss", d);
    }

    //转义user的status
    function userstatusDes(s) {
        if (s == USER_STATUS_NORMAL) {
            return "正常";
        } else {
            return "不正常";
        }
    }

    //转义角色
    function roleDes(s) {
        if (s == ROLE_TENANTADMIN) {
            return "租户管理员";
        } else if (s == ROLE_TENANT) {
            return "操作员";
        } else if (s == ROLE_SYSTEM) {
            return "管理员";
        }
    }

    //转移告警status
    function gaojingStatusDes(s) {
        if (s == GAOJING_INIT) {
            return "未处理";
        } else if (s == GAOJING_DONE) {
            return "已处理";
        } else if (s == GAOJING_IGNORE) {
            return "已忽略";
        } else {
            return "未知状态";
        }
    }

    /**
     * 将【参数对象：obj_params】序列化为"?param_a=value_a&param_b=value_b"的形式
     * @param obj_params    参数对象
     */
    function serializeParams(obj_params) {
        if (!obj_params) {
            console.error('[tools.serializeParams] obj_params 为空！ obj_params: ');
            console.warn(obj_params);
            return '';
        }
        var arr_str_params = ['?'];
        for (var name_obj_params in obj_params) {
            var value_obj_params = obj_params[name_obj_params];
            if (1 !== arr_str_params.length) {
                arr_str_params.push('&');
            }
            arr_str_params.push(name_obj_params, '=', value_obj_params);
        }
        // 有 1 个参数，至少长度都是 4
        if (arr_str_params.length < 4) {
            console.error('[tools.serializeParams] arr_str_params 没有意义！ arr_str_params: ');
            console.warn(arr_str_params);
            return '';
        }
        //
        return arr_str_params.join('');
    }

    var todayStartEndDateTimeTool = {
        CommonTime: (function () {
            var ONE_SEC = 1000
                , ONE_MIN = 60 * ONE_SEC
                , ONE_HOUR = 60 * ONE_MIN
                , ONE_DAY = 24 * ONE_HOUR
            return {
                ONE_SEC: ONE_SEC
                , ONE_MIN: ONE_MIN
                , ONE_HOUR: ONE_HOUR
                , ONE_DAY: ONE_DAY
            };
        })()
        , getTodayStartDateTime: function (offsetTime) {
            var date = new Date();
            // var date = new Date(1501833236607); // 测试，定为 8 月 4 日
            // var date = new Date(1501721236607); // 测试，定为 8 月 3 日
            date.setHours(8);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if (offsetTime) {
                date = new Date(date.getTime() + offsetTime);
            }
            return date;
        }
        , checkIsTimestampBetweenStartEnd: checkIsTimestampBetweenStartEnd
    };

    /**
     * 检查 timestamp 是否在 startTimestamp 和 EndTimeStamp 中间
     * @param timestamp
     * @returns {boolean}
     */
    function checkIsTimestampBetweenStartEnd(timestamp) {
        if (timestamp >= checkIsTimestampBetweenStartEnd.getStartTimestamp()
            && timestamp <= checkIsTimestampBetweenStartEnd.getEndTimestamp()) {
            return true;
        }
        return false;
    }

    checkIsTimestampBetweenStartEnd.getStartTimestamp = function () {
        if (!checkIsTimestampBetweenStartEnd.startTime) {
            checkIsTimestampBetweenStartEnd.startTime = todayStartEndDateTimeTool.getTodayStartDateTime().getTime();
        }
        return checkIsTimestampBetweenStartEnd.startTime;
    };
    checkIsTimestampBetweenStartEnd.getEndTimestamp = function () {
        if (!checkIsTimestampBetweenStartEnd.endTime) {
            checkIsTimestampBetweenStartEnd.endTime = todayStartEndDateTimeTool.getTodayStartDateTime(todayStartEndDateTimeTool.CommonTime.ONE_DAY).getTime();
        }
        return checkIsTimestampBetweenStartEnd.endTime;
    };
    // End  : 所有的 function

    // 导出的模块名和接口函数
    exports('tools', {
        getQueryString: getQueryString
        // Start: 左侧导航菜单和顶部 tab 相关
        , indexLeftNavTopTab: LeftNavTabManager.indexLeftNavTopTab
        , jumpLeftNavTab: LeftNavTabManager.jumpLeftNavTab
        // End  : 左侧导航菜单和顶部 tab 相关
        , deviceid2des: deviceid2des
        , deviceStatus2des: deviceStatus2des
        , renderSelectOption: renderSelectOption
        , timestampToString: timestampToString
        , serializeParams: serializeParams
        , deviceType2des: deviceType2des
        //
        , todayStartEndDateTimeTool: todayStartEndDateTimeTool
        , userstatusDes: userstatusDes
        , roleDes: roleDes
        , gaojingStatusDes: gaojingStatusDes

    });
});
