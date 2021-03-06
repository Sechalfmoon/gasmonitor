(function() {
    layui.use(['jquery', 'oneSocket', 'laytpl', 'layer', 'form', 'tools', 'tree', 'laydate', 'webStorageCache'], function() {
        var $ = layui.jquery
            , oneSocket = layui.oneSocket(/*SockJS, Stomp*/)
            , laytpl = layui.laytpl
            , layer = layui.layer
            , form = layui.form()
            , tools = layui.tools
            , todayStartEndDateTimeTool = tools.todayStartEndDateTimeTool
            , laydate = layui.laydate
            , webStorageCache = layui.webStorageCache
            , sitesAndDevicesTreeCacheManager = webStorageCache.sitesAndDevicesTreeCacheManager
            , monitorDataCacheManager = webStorageCache.monitorDataCacheManager;

        // Start: 所有被本模块调用的函数定义在此

        function getTodayStartDateTime_compare(offsetTime) {
            // var date = new Date();
            // var date = new Date(1501833236607); // 测试，定为 8 月 4 日
            // var date = new Date(1501721236607); // 测试，定为 8 月 3 日
            var date = getTodayStartDateTime_compare.compareTime;
            date.setHours(8);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            if(offsetTime) {
                date = new Date(date.getTime() + offsetTime);
            }
            return date;
        }
        // compareTime 默认为昨天
        var now = todayStartEndDateTimeTool.getTodayStartDateTime();
        getTodayStartDateTime_compare.compareTime = todayStartEndDateTimeTool.getTodayStartDateTime(-todayStartEndDateTimeTool.CommonTime.ONE_DAY);


        function checkIsTimestampBetweenStartEnd_compare(timestamp) {
            if(timestamp >= checkIsTimestampBetweenStartEnd_compare.getStartTimestamp()
                && timestamp <= checkIsTimestampBetweenStartEnd_compare.getEndTimestamp()) {
                return true;
            }
            return false;
        }
        checkIsTimestampBetweenStartEnd_compare.getStartTimestamp = function() {
            if(!checkIsTimestampBetweenStartEnd_compare.startTime) {
                checkIsTimestampBetweenStartEnd_compare.startTime = getTodayStartDateTime_compare().getTime();
            }
            return checkIsTimestampBetweenStartEnd_compare.startTime;
        };
        checkIsTimestampBetweenStartEnd_compare.getEndTimestamp = function() {
            if(!checkIsTimestampBetweenStartEnd_compare.endTime) {
                checkIsTimestampBetweenStartEnd_compare.endTime = getTodayStartDateTime_compare(todayStartEndDateTimeTool.CommonTime.ONE_DAY).getTime();
            }
            return checkIsTimestampBetweenStartEnd_compare.endTime;
        };

        // var data = [];
        // var dataInit = [];
        /*var testRefreshData = function() {
            layer.msg('testRefreshData index: ' + testRefreshData.index);
            // data.shift();
            data.push(randomData(testRefreshData.index++));
            myChartsArr[0].setOption({
                series: [
                    {
                        data: data
                    }
                ]
            });
        };
        testRefreshData.index = 1;
        setInterval(testRefreshData, 2000);*/
        var value = Math.random() * 1000;
        function randomData(index_i, isInit) {
            var tmp_now = now;
            now = new Date(+now + (isInit ? todayStartEndDateTimeTool.CommonTime.ONE_DAY : todayStartEndDateTimeTool.CommonTime.ONE_MIN) * (isInit ? 1 : index_i));
            value = isInit ? 0 : (value + Math.random() * 21 - 10);
            return {
                name: tmp_now.toString(),
                value: [
                    /*[tmp_now.getFullYear(), tmp_now.getMonth() + 1, tmp_now.getDate(), tmp_now.getHours()
                        , tmp_now.getMinutes(), tmp_now.getSeconds()].join('/')*/
                    // laydate.now(tmp_now.getTime(), 'YYYY-MM-DD hh-mm-ss'),
                    laydate.now(tmp_now.getTime(), 'YYYY-MM-DD hh:mm:ss'),
                    Math.round(value)
                ]
            }
        }
        /*for (var i = 0, max_i = 2/!* * 60 * 60*!/; i <= max_i; i++) {
            dataInit.push(randomData(i, true));
        }*/
        now = todayStartEndDateTimeTool.getTodayStartDateTime();

        // Start: #date-history_echarts 绑定 input 或 change 事件，在这里保证只绑定一次
        var date_historyEcharts_inputChangeChecker = (function() {
            var _date_historyEcharts_inputChangeChecker = {
                timerId: 0
                , inputEleId: '#date-history_echarts'
                , inputEle: null
                , curVal: null
            };
            var date_historyEcharts_inputChangeChecker = {
                init: function() {
                    var private_self = _date_historyEcharts_inputChangeChecker;

                    private_self.timerId = 0;
                    private_self.inputEleId = '#date-history_echarts';
                    private_self.inputEle = $(private_self.inputEleId);
                    private_self.curVal = private_self.inputEle.val();
                }
                , startCheck: function(callback) {
                    var self = this, private_self = _date_historyEcharts_inputChangeChecker;

                    if(!$(private_self.inputEleId)) {
                        // clearInterval(self.timerId);
                        return ;
                    }

                    var tmpVal = private_self.inputEle.val();
                    if(tmpVal != private_self.curVal) {
                        private_self.curVal = tmpVal;
                        if(callback && callback instanceof Function) {
                            callback(private_self.curVal);
                        }
                    }
                    //
                    private_self.timerId = setTimeout(function () {
                        self.startCheck(callback);
                    }, 1000);
                }
            };
            /*$(document).on('blur', '#date-history_echarts', function() {
                layer.msg(['[历史日期： ', $(this).val(), ']'].join(''));
            });*/
            return date_historyEcharts_inputChangeChecker;
        })();
        // End  : #date-history_echarts 绑定 input 或 change 事件，在这里保证只绑定一次

        // Start: 渲染历史日期数据到折线图
        var renderHistoryData2Charts_compare;
        // End  : 渲染历史日期数据到折线图

        // Start: 在折线图被点击和右上角 compare 按钮被点击后，执行下面 function 展示 compare layer
        var onClick2ShowCompareLayer = function(hardwareId, subId, subTitle, deviceName) {
            // Start: functions
            function renderCompareSelectAndLaydate() {
                laytpl(tpl_eCharts_compare_selectAndLaydate.innerHTML).render({}, function(html_compareSelectAndLaydate) {
                    $('#echarts-compare').parents('.layui-layer.layui-layer-page').find('.layui-layer-btn').prepend(html_compareSelectAndLaydate);
                    //
                    $('#select-today_echarts_type').val(subId);
                    form.render();
                    // 修正 select 的样式为向上弹出
                    var elem_dl_layuiSelectGroup = $('#select-today_echarts_type').next('div.layui-unselect').find('dl.layui-select-group');
                    elem_dl_layuiSelectGroup.css('margin-top', ['-', 60 + elem_dl_layuiSelectGroup.height(), 'px'].join(''));
                    // laydate 历史曲线日期
                    /*laydate({
                        elem: '#date-history_echarts', //需显示日期的元素选择器
                        event: 'click', //触发事件
                        format: 'YYYY-MM-DD', //日期格式
                        istime: false, //是否开启时间选择
                        isclear: true, //是否显示清空
                        istoday: true, //是否显示今天
                        issure: true, // 是否显示确认
                        festival: true, //是否显示节日
                        min: '1900-01-01 00:00:00', //最小日期
                        max: laydate.now(checkIsTimestampBetweenStartEnd_compare.getStartTimestamp(), 'YYYY-MM-DD hh:mm:ss'), //最大日期
                        start: laydate.now(checkIsTimestampBetweenStartEnd_compare.getStartTimestamp(), 'YYYY-MM-DD hh:mm:ss'),  //开始日期
                        fixed: false, //是否固定在可视区域
                        zIndex: 99999999, //css z-index
                        choose: function(dates){ //选择好日期的回调
                            console.log('[laydate]dates: ' + dates);
                        }
                    });*/
                    $('#date-history_echarts').val(laydate.now(checkIsTimestampBetweenStartEnd_compare.getStartTimestamp(), 'YYYY-MM-DD'));
                    // #date-history_echarts 绑定的 change 事件在外层，以保证只调用一次
                    date_historyEcharts_inputChangeChecker.init();
                    date_historyEcharts_inputChangeChecker.startCheck(function(curInputVal) {
                        layer.msg(['[历史曲线日期： ', curInputVal, ']'].join(''));
                        getTodayStartDateTime_compare.compareTime = new Date(Date.parse(curInputVal.replace(/-/g,  "/")));
                        checkIsTimestampBetweenStartEnd_compare.startTime = null;
                        checkIsTimestampBetweenStartEnd_compare.endTime = null;
                        renderHistoryData2Charts_compare();
                    });
                });
            }
            /**
             * 打开 layer - 折线图对比
             * @param layerContent
             */
            function openLayer_eChartsCompare(layerContent) {
                layer.open({
                    type: 1
                    , title: '折线图对比（测试数据）'
                    , area: ['100%', '100%']
                    , shadeClose: true //开启遮罩关闭
                    , maxmin: true
                    , content: layerContent
                    , success: function(layero, index){
                        console.log(layero, index);
                        initLayerEChartsCompare(hardwareId, deviceName, subId, subTitle);
                        // Start: 渲染打开的弹框中的 select ，和 laydate
                        renderCompareSelectAndLaydate();
                        // End  : 渲染打开的弹框中的 select ，和 laydate
                    }
                    , btn: ['关闭']
                    , yes: function (index, layero) {
                        // console.log(layero);
                        layer.msg('点击了按钮 关闭');
                        //按钮【按钮一】的回调
                        layer.close(index);
                        // alert("点击了按钮1");
                    }
                });
            }

            /**
             * 初始化 layer 中的 eCharts
             */
            function initLayerEChartsCompare(hardwareId, deviceName, subId, subTitle) {
                layer.msg(['[initLayerEChartsCompare][hardwareId: ', hardwareId, '][deviceName: '
                    , deviceName, '][subId: ', subId, '][subTitle: ', subTitle, ']'].join(''));

                var myChart_compare = echarts.init(document.getElementById('echarts-compare'));

                var colors = ['#5793f3', '#d14a61', '#675bba'];
                var option_base = optionsArr[subId];

                // Start: 从数据库获取 8 月 3 日数据，做对比测试
                // renderHistoryData2Charts_compare.hardwareId = hardwareId;
                renderHistoryData2Charts_compare = function() {
                    // $.get('http://localhost:9099/point/query/history?hardwareId=t21s1d1&begin=2017-08-03:08:00:00&end=2017-08-04:08:00:00', {}, function(data) {console.log(data)}, 'json')
                    // 1. 请求 http://localhost:9099/point/query/history?hardwareId=t21s1d1&begin=2017-08-03:08:00:00&end=2017-08-04:08:00:00
                    // var params_history = {hardwareId: 't21s1d1', begin: '2017-08-04:08:00:00', end: '2017-08-05:08:00:00'};
                    // var params_history_compare = {hardwareId: 't21s1d1', begin: '2017-08-03:08:00:00', end: '2017-08-04:08:00:00'};
                    var params_history_compare = {hardwareId: hardwareId
                        , begin: laydate.now(checkIsTimestampBetweenStartEnd_compare.getStartTimestamp(), 'YYYY-MM-DD:hh:mm:ss')
                        , end: laydate.now(checkIsTimestampBetweenStartEnd_compare.getEndTimestamp(), 'YYYY-MM-DD:hh:mm:ss')};
                    var url_get_history_compare = '/point/query/history' + tools.serializeParams(params_history_compare);
                    var max_history_compare = 1000;  // 历史测点的 max 数目
                    var callback_history_compare = function(data_history_compare) {
                        console.log('[device_manage_echarts.js callback_history_compare] data_history_compare: ');
                        console.log(data_history_compare);
                        //
                        var code = data_history_compare.code, msg = data_history_compare.msg, page = data_history_compare.page
                            , total = data_history_compare.total, totalPage = data_history_compare.totalPage
                            , arr_monitorData = data_history_compare.data;
                        console.log('[device_manage_echarts.js callback_history_compare] code: ' + code);
                        console.log('[device_manage_echarts.js callback_history_compare] msg: ' + msg);
                        console.log('[device_manage_echarts.js callback_history_compare] page: ' + page);
                        console.log('[device_manage_echarts.js callback_history_compare] total: ' + total);
                        console.log('[device_manage_echarts.js callback_history_compare] totalPage: ' + totalPage);
                        console.log('[device_manage_echarts.js callback_history_compare] arr_monitorData: ');
                        console.log(arr_monitorData);
                        // 处理 arr_monitorData
                        function processMonitorData_sync_compare(item_monitorData, index_monitorData, isJSONObj, isNot2Render) {
                            console.log('[device_manage_echarts.js processMonitorData_sync_compare] index_monitorData: ' + index_monitorData);
                            console.log('[device_manage_echarts.js processMonitorData_sync_compare] isNot2Render: ' + isNot2Render);
                            /*setTimeout(function() {
                                processMonitorData(item_monitorData, isJSONObj, isNot2Render);
                                if(!isNot2Render) {
                                    layer.closeAll('loading');   //关闭所有的loading
                                }
                            }, index_monitorData * 1);*/
                            function getJDataFieldVal_compare(subId, item_monitorData) {
                                // .temperature .pressure .standard .running
                                var gasEvent = item_monitorData.gasEvent;
                                var jDataFieldVal = gasEvent.temperature;
                                switch (subId) {
                                    case 1:
                                        jDataFieldVal = gasEvent.pressure;
                                        break;
                                    case 2:
                                        jDataFieldVal = gasEvent.standard;
                                        break;
                                    case 3:
                                        jDataFieldVal = gasEvent.running;
                                        break;
                                }
                                return jDataFieldVal;
                            }
                            var jDataPointTime = new Date(item_monitorData.gasEvent.pointtime);
                            var jDataFieldVal = getJDataFieldVal_compare(subId, item_monitorData);
                            return {
                                name: jDataPointTime.toString(),
                                value: [
                                    laydate.now(jDataPointTime.getTime(), 'YYYY-MM-DD hh:mm:ss'),
                                    Math.round(jDataFieldVal)
                                ]
                            };
                        }
                        function processMonitorDataArr_compare(arr_monitorData) {
                            var arr_data_compare = [];
                            if(arr_monitorData && arr_monitorData.length && arr_monitorData.length > 0) {
                                // 先筛除掉 arr_monitorData 中不合格的数据（时间范围不在图中开始结束时间范围以内的）
                                var arr_filtered_monitorData = [];
                                arr_monitorData.forEach(function(item_monitorData) {
                                    if(checkIsTimestampBetweenStartEnd_compare(item_monitorData.gasEvent.pointtime)) {
                                        arr_filtered_monitorData.push(item_monitorData);
                                    }
                                });
                                arr_monitorData = arr_filtered_monitorData;
                                // 先按 max_history_compare 抽样 arr_monitorData
                                var length_arr_monitorData = arr_monitorData.length
                                    , arr_sample_monitorData = arr_monitorData;
                                if(length_arr_monitorData > max_history_compare) {
                                    arr_sample_monitorData = [];
                                    // var step = Math.floor(length_arr_monitorData / max_history_compare);
                                    var step = length_arr_monitorData / max_history_compare;
                                    for(var i = 0, i_step = 0; i < length_arr_monitorData && arr_sample_monitorData.length < max_history_compare; i = Math.round(i_step += step)) {
                                        arr_sample_monitorData.push(arr_monitorData[i]);
                                    }
                                }
                                console.log('[device_manage_echarts.js processMonitorDataArr_compare] arr_sample_monitorData.length: ' + arr_sample_monitorData.length);
                                // Start: 对 arr_sample_monitorData 中的数据进行排序
                                arr_sample_monitorData.sort(function(a_sample_monitorData, b_sample_monitorData) {
                                    return a_sample_monitorData.gasEvent.pointtime - b_sample_monitorData.gasEvent.pointtime;
                                });
                                // End  : 对 arr_sample_monitorData 中的数据进行排序
                                arr_sample_monitorData.forEach(function(item_monitorData, index_monitorData) {
                                    var isNot2Render = !(index_monitorData + 1 === arr_sample_monitorData.length);
                                    arr_data_compare.push(processMonitorData_sync_compare(item_monitorData, index_monitorData, true
                                        , isNot2Render));
                                });
                                // 及时关闭 layer.loading
                                if(arr_sample_monitorData.length < 1) {
                                    layer.closeAll('loading');
                                }
                            }
                            return arr_data_compare;
                        }
                        var arr_data_compare = processMonitorDataArr_compare(arr_monitorData);
                        //
                        renderOptionCompare(arr_data_compare);
                    };
                    // 2. 发 get 请求
                    layer.load();
                    $.get(url_get_history_compare, {}, callback_history_compare, 'json');
                };
                renderHistoryData2Charts_compare();
                // End  : 从数据库获取 8 月 3 日数据，做对比测试

                function renderOptionCompare(arr_data_compare) {
                    var legend_history = ['[历史【', subTitle, '】曲线，时间：'
                        , laydate.now(checkIsTimestampBetweenStartEnd_compare.getStartTimestamp(), 'YYYY-MM-DD')
                        , '，采集点数：', arr_data_compare.length, ']'].join('');
                    var legend_today = ['[今日【', subTitle, '】曲线，时间：'
                        , laydate.now(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd.getStartTimestamp(), 'YYYY-MM-DD')
                        , '，采集点数：', option_base.series[0].data.length, ']'].join('');
                    var option_compare = {
                        title: {
                            text: ['设备', deviceName].join('')
                        },

                        color: colors,

                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross'
                            }
                            /*, formatter: function(params) {
                                console.log(params);
                                return ['[', params[0].seriesName, ']: ', params[0].value[1]].join('');
                            }*/
                            /*formatter: function (params) {
                                params = params[0];
                                var date = new Date(params.name);
                                return ['[', laydate.now(date.getTime(), 'YYYY-MM-DD hh:mm:ss'), '] : '
                                    , params.value[1]].join('');
                            },
                            axisPointer: {
                                animation: false,
                                type: 'cross',
                                label: {
                                    backgroundColor: '#6a7985'
                                }
                            }*/
                        },
                        legend: {
                            right: 150,
                            data:[legend_history, legend_today]
                        },
                        toolbox: {
                            show: true,
                            feature: {
                                dataZoom: {
                                    yAxisIndex: 'none'
                                },
                                dataView: {readOnly: false},
                                // magicType: {type: ['line', 'bar']},
                                restore: {},
                                saveAsImage: {}
                            }
                        },
                        /*dataZoom: {
                            show: false,
                            start: 0,
                            end: 100
                        },*/
                        grid: {
                            left: 8,
                            right: 28,
                            bottom: 30,
                            top: 45,
                            containLabel: true
                        },
                        xAxis: [
                            {
                                type: 'time',
                                /*splitLine: {
                                    show: false
                                },*/
                                min: laydate.now(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd.getStartTimestamp(), 'YYYY-MM-DD hh:mm:ss'),
                                max: laydate.now(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd.getEndTimestamp(), 'YYYY-MM-DD hh:mm:ss'),

                                // type: 'category',
                                name: legend_today,
                                nameLocation: 'middle',
                                nameGap: 38,
                                boundaryGap: false,
                                axisTick: {
                                    alignWithLabel: true
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        color: colors[1]
                                    }
                                },
                                axisPointer: {
                                    label: {
                                        formatter: function (params) {
                                            /*params = params[0];
                                            var date = new Date(params.name);
                                            return ['[', laydate.now(date.getTime(), 'YYYY-MM-DD hh:mm:ss'), '] : '
                                                , params.value[1]].join('');*/

                                            var seriesDataVal = '';
                                            if(params.seriesData && params.seriesData.length
                                                && params.seriesData[0] && params.seriesData[0].data
                                                && params.seriesData[0].data.value && params.seriesData[0].data.value[1]) {
                                                seriesDataVal = '：' + params.seriesData[0].data.value[1];
                                            }

                                            return ['[', laydate.now(params.value, 'YYYY-MM-DD hh:mm:ss'), ']', seriesDataVal].join('');
                                        }
                                    }
                                }// ,
                                // data: ["8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00", "2:00", "4:00", "6:00", "8:00"]
                            },
                            {
                                // type: 'category',
                                type: 'time',
                                /*splitLine: {
                                    show: false
                                },*/
                                min: laydate.now(checkIsTimestampBetweenStartEnd_compare.getStartTimestamp(), 'YYYY-MM-DD hh:mm:ss'),
                                max: laydate.now(checkIsTimestampBetweenStartEnd_compare.getEndTimestamp(), 'YYYY-MM-DD hh:mm:ss'),

                                name: legend_history,
                                nameLocation: 'middle',
                                nameGap: 38,
                                boundaryGap: false,
                                axisTick: {
                                    alignWithLabel: true
                                },
                                axisLine: {
                                    onZero: false,
                                    lineStyle: {
                                        color: colors[0]
                                    }
                                },
                                axisPointer: {
                                    label: {
                                        formatter: function (params) {
                                            /*params = params[0];
                                            var date = new Date(params.name);
                                            return ['[', laydate.now(date.getTime(), 'YYYY-MM-DD hh:mm:ss'), '] : '
                                                , params.value[1]].join('');*/

                                            var seriesDataVal = '';
                                            if(params.seriesData && params.seriesData.length
                                                && params.seriesData[0] && params.seriesData[0].data
                                                && params.seriesData[0].data.value && params.seriesData[0].data.value[1]) {
                                                seriesDataVal = '：' + params.seriesData[0].data.value[1];
                                            }

                                            return ['[', laydate.now(params.value, 'YYYY-MM-DD hh:mm:ss'), ']', seriesDataVal].join('');
                                        }
                                    }
                                },
                                // data: ["8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "24:00", "2:00", "4:00", "6:00", "8:00"]
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value'
                                /*boundaryGap: [0, '100%'],
                                splitLine: {
                                    show: false
                                },

                                type: 'value',
                                scale: true,
                                // name: [subTitle, '值'].join(''),
                                nameGap: 8,
                                min: 0*/
                                // boundaryGap: [0.2, 0.2]
                            }
                        ],
                        series: [
                            {
                                /*showSymbol: false,
                                hoverAnimation: false,*/
                                name: legend_history,
                                type:'line',
                                xAxisIndex: 1,
                                smooth: true,
                                data: arr_data_compare // [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 154.3, 48.7, 18.8, 6.0, 2.3]
                            },
                            {
                                /*showSymbol: false,
                                hoverAnimation: false,*/
                                name: legend_today,
                                type:'line',
                                smooth: true,
                                /*{
                                 name: jDataPointTime.toString(),
                                 value: [
                                 laydate.now(jDataPointTime.getTime(), 'YYYY-MM-DD hh:mm:ss'),
                                 Math.round(jDataFieldVal)
                                 ]
                                 }*/
                                data: option_base.series[0].data// [3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 122.5, 46.6, 55.4, 18.4, 10.3, 0.7]
                            }
                        ]
                    };
                    myChart_compare.setOption(option_compare);
                    layer.closeAll('loading');   //关闭所有的loading
                }
            }
            // End  : functions
            laytpl(tpl_eCharts_compare.innerHTML).render({}, function(html_tpl_eCharts_compare) {
                openLayer_eChartsCompare(html_tpl_eCharts_compare);
            });
        };
        // End  : 在折线图被点击和右上角 compare 按钮被点击后，执行下面 function 展示 compare layer

        // 4 个折线图每个的 title
        var subTitlesArr = ['温度', '压力', '标况流量', '工况流量'];

        function genOption(hardwareId, subId, deviceName) {
            var subTitle = subTitlesArr[subId];
            var option = {
                title: {
                    text: subTitle,
                    subtext: deviceName/*['[', hardwareId, ' : ', deviceName, ']'].join('')*/
                },
                backgroundColor: '#CCFFCC',
                tooltip: {
                    trigger: 'axis',
                    formatter: function (params) {
                        params = params[0];
                        var date = new Date(params.name);
                        return ['[', laydate.now(date.getTime(), 'YYYY-MM-DD hh:mm:ss'), '] : '
                            , params.value[1]].join('');
                    },
                    axisPointer: {
                        animation: false,
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    }
                },
                legend: {
                    data:[subTitle/*, 'summary'*/]
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        dataView: {readOnly: false},
                        // magicType: {type: ['line', 'bar']},
                        restore: {},
                        saveAsImage: {},
                        // Start: 自定义的工具栏按钮 - 对比
                        myTool_compare: {
                            show: true,
                            title: '对比',
                            icon: 'path://M247.1424 794.9824c-1.0752 0-2.176-0.0768-3.2768-0.2304-10.8032-1.3568-19.6096-9.3952-21.9648-20.0448L112.64 282.112c-3.0976-13.952 5.7088-27.7504 19.6608-30.848 13.8752-3.1232 27.7504 5.7088 30.848 19.6608l93.6704 422.3232 218.5472-428.4928c6.5024-12.7232 22.016-17.792 34.7904-11.2896 12.7232 6.5024 17.7664 22.0672 11.2896 34.7904l-251.2384 492.6208C265.7024 789.6064 256.768 794.9824 247.1424 794.9824zM669.184 793.7792c-4.8128 0-9.7024-0.128-14.6176-0.3584-58.4448-3.0976-104.9344-22.912-134.4-57.3696-24.1664-28.2112-34.8416-63.7696-30.848-102.784l0.5888-5.0176c1.9712-14.1568 14.9248-24.0128 29.2096-22.0672 14.1568 1.9712 24.0128 15.0272 22.0672 29.2096l-0.3584 3.1488c-2.5088 24.576 3.9424 46.6432 18.6624 63.8208 20.0704 23.424 53.888 37.0432 97.8432 39.3728 85.9648 4.48 151.8848-41.9584 169.9584-87.9616 18.0736-45.9776-27.6992-74.7776-48.1792-85.0176-10.3424-5.1712-31.4624-10.9056-53.7856-16.9984-65.3312-17.7664-146.6368-39.8848-174.8736-95.0784-12.1088-23.6288-12.8256-49.9968-2.176-78.336 19.0208-50.56 51.1488-86.2464 95.488-106.0096 51.5072-22.9632 119.8848-22.0416 182.8608 2.5344 75.8016 29.568 89.7792 108.3136 86.5792 145.8176-1.2032 14.2336-13.568 24.8064-27.9808 23.6032-14.208-1.2032-24.7296-13.6448-23.6032-27.8528l0 0c0.2304-2.8672 4.5568-70.5792-53.7856-93.3376-50.3552-19.6352-103.7824-20.9664-142.976-3.4816-31.2576 13.9264-54.1696 39.8592-68.1472 76.9792-7.1936 19.072-3.5584 30.0032-0.2048 36.5568 17.792 34.816 92.7488 55.1936 142.3872 68.7104 26.0096 7.0656 48.4352 13.1584 63.36 20.6336 68.1728 34.0992 96.2304 91.648 73.1904 150.2208C851.2256 734.2848 773.4272 793.7792 669.184 793.7792zM1024 214.6048 1024 732.928c0 14.08-11.52 25.6-25.6 25.6s-25.6-11.52-25.6-25.6L972.8 214.6048c0-33.536-28.416-60.928-61.952-60.928L112.128 153.6768C78.592 153.6768 51.2 178.2528 51.2 211.7888l0 597.8624c0 33.536 27.392 60.928 60.928 60.928l742.7584 0c14.08 0 25.6 11.52 25.6 25.6s-11.52 25.6-25.6 25.6L112.128 921.7792c-61.952 0-112.128-50.176-112.128-112.128L0 211.7888c0-61.952 50.176-109.312 112.128-109.312l798.72 0C972.544 102.4768 1024 152.6528 1024 214.6048z',
                            onclick: function () {
                                onClick2ShowCompareLayer(hardwareId, subId, subTitle, deviceName);
                            }
                        }
                        // End  : 自定义的工具栏按钮 - 对比
                    }
                },
                dataZoom: {
                    show: false,
                    start: 0,
                    end: 100
                },
                grid: {
                    left: '0%',
                    right: '6%',
                    bottom: '0%',
                    top: 75,
                    containLabel: true
                },
                xAxis: {
                    // type: 'category',
                    type: 'time',
                    splitLine: {
                        show: false
                    },
                    name: '时间',
                    min: laydate.now(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd.getStartTimestamp(), 'YYYY-MM-DD hh:mm:ss'),
                    max: laydate.now(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd.getEndTimestamp(), 'YYYY-MM-DD hh:mm:ss'),
                    boundaryGap: false/*,
                    data: (function (){
                        var now = todayStartEndDateTimeTool.getTodayStartDateTime();
                        var res = [];
                        var len = 25;
                        while (len--) {
                            res.push(laydate.now(now.getTime(), 'YYYY-MM-DD hh:mm:ss'));
                            now = new Date(+now + todayStartEndDateTimeTool.CommonTime.ONE_HOUR);
                        }
                        return res;
                    })()*/
                },
                yAxis: {
                    boundaryGap: [0, '100%'],
                    splitLine: {
                        show: false
                    },

                    type: 'value',
                    scale: true,
                    name: [subTitle, '值'].join(''),
                    nameGap: 8,
                    min: 0
                    // boundaryGap: [0.2, 0.2]
                },
                series: [
                    {
                        showSymbol: false,
                        hoverAnimation: false,

                        name: subTitle,
                        type:'line',
                        // areaStyle: {normal: {}},
                        data: []
                        /*data:(function (){
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.push(Math.round(Math.random() * 1000));
                            }
                            return res;
                        })()*/
                    }/*,
                    {
                        name:'summary',
                        type:'line',
                        areaStyle: {normal: {}},
                        data: dataInit
                        /!*data:(function (){
                            var res = [];
                            var len = 0;
                            while (len < 10) {
                                res.push((Math.random()*1000 + 5).toFixed(1) - 0);
                                len++;
                            }
                            return res;
                        })()*!/
                    }*/
                ]
            };

            return option;
        }

        var genOptionBattery = function (hardwareId, deviceName) {
            var optionBattery = {
                series: [{
                    type: 'liquidFill',
                    data: [],
                    radius: '60%',
                    outline: {
                        show: false
                    },
                    backgroundStyle: {
                        borderColor: '#156ACF',
                        borderWidth: 1,
                        shadowColor: 'rgba(0, 0, 0, 0.4)',
                        shadowBlur: 20
                    },
                    // shape: 'path://M367.855,428.202c-3.674-1.385-7.452-1.966-11.146-1.794c0.659-2.922,0.844-5.85,0.58-8.719 c-0.937-10.407-7.663-19.864-18.063-23.834c-10.697-4.043-22.298-1.168-29.902,6.403c3.015,0.026,6.074,0.594,9.035,1.728 c13.626,5.151,20.465,20.379,15.32,34.004c-1.905,5.02-5.177,9.115-9.22,12.05c-6.951,4.992-16.19,6.536-24.777,3.271 c-13.625-5.137-20.471-20.371-15.32-34.004c0.673-1.768,1.523-3.423,2.526-4.992h-0.014c0,0,0,0,0,0.014 c4.386-6.853,8.145-14.279,11.146-22.187c23.294-61.505-7.689-130.278-69.215-153.579c-61.532-23.293-130.279,7.69-153.579,69.202 c-6.371,16.785-8.679,34.097-7.426,50.901c0.026,0.554,0.079,1.121,0.132,1.688c4.973,57.107,41.767,109.148,98.945,130.793 c58.162,22.008,121.303,6.529,162.839-34.465c7.103-6.893,17.826-9.444,27.679-5.719c11.858,4.491,18.565,16.6,16.719,28.643 c4.438-3.126,8.033-7.564,10.117-13.045C389.751,449.992,382.411,433.709,367.855,428.202z',
                    shape: 'path://M680 104.8h-84c0-22.4-18.9-40.7-42-40.7h-84c-23.1 0-42 18.3-42 40.7h-84c-46.2 0-84 36.6-84 81.4v692.3c0 44.7 37.8 81.4 84 81.4h336c46.2 0 84-36.6 84-81.4V186.2c0-44.7-37.8-81.4-84-81.4z m-72.7 383.6L413.6 743.2l64.6-179.4h-72.1L478.2 352h139.7l-91.6 136.4h81z',
                    label: {
                        normal: {
                            position: ['26.5%', '80%'],
                            formatter: function (seriesObj) {
                                debugger;
                                var batteryVolt = (seriesObj.value || seriesObj.value === 0) ? seriesObj.value : '-';
                                return '电池电压（V）： ' + batteryVolt;
                            },
                            textStyle: {
                                fontSize: 12,
                                color: '#D94854'
                            }
                        }
                    }
                }]
            };
            return optionBattery;
        };

        // render function
        function renderUpdatedData2ChartsBattery(myChartBattery, optionBattery, jDataHardwareId, jDataBattery, isNot2Render) {
            console.info(['[renderUpdatedData2ChartsBattery] isNot2Render: ', isNot2Render].join(''));
            debugger;
            if (!myChartBattery || !optionBattery || !jDataHardwareId || (!jDataBattery && jDataBattery !== 0)) {
                console.error('[renderUpdatedData2ChartsBattery] 参数检查有误：');
                console.info(['[renderUpdatedData2ChartsBattery] myChartBattery: ', myChartBattery].join(''));
                console.info(['[renderUpdatedData2ChartsBattery] optionBattery: ', optionBattery].join(''));
                console.info(['[renderUpdatedData2ChartsBattery] jDataHardwareId: ', jDataHardwareId].join(''));
                console.info(['[renderUpdatedData2ChartsBattery] jDataBattery: ', jDataBattery].join(''));
                return;
            }
            //
            /*var data0 = optionBattery.series[0].data;
            data0 = [4.1];*/
            //
            console.log('[renderUpdatedData2ChartsBattery] isNot2Render: ' + isNot2Render);
            if (!isNot2Render) {
                myChartBattery.setOption({
                    series: [
                        {
                            data: [220, jDataBattery || 4.1]
                        }
                    ]
                });
            }
        }
        function renderUpdatedData2Charts(myChart2Render, myChart2RenderOption, jDataHardwareId, jDataFieldVal
                                          , jDataSummaryVal, jDataPointTimeVal, isNot2Render) {
            if(!myChart2Render || !myChart2RenderOption || !jDataHardwareId || (!jDataFieldVal && jDataFieldVal !== 0)
                || (!jDataSummaryVal && jDataSummaryVal !== 0) || (!jDataPointTimeVal && jDataPointTimeVal !== 0)) {
                console.error('[renderUpdatedData2Charts] 参数检查有误：');
                console.info(['[renderUpdatedData2Charts] myChart2Render: ',        myChart2Render      ].join(''));
                console.info(['[renderUpdatedData2Charts] myChart2RenderOption: ',  myChart2RenderOption].join(''));
                console.info(['[renderUpdatedData2Charts] jDataHardwareId: ',       jDataHardwareId     ].join(''));
                console.info(['[renderUpdatedData2Charts] jDataFieldVal: ',         jDataFieldVal       ].join(''));
                console.info(['[renderUpdatedData2Charts] jDataSummaryVal: ',       jDataSummaryVal     ].join(''));
                console.info(['[renderUpdatedData2Charts] jDataPointTimeVal: ',     jDataPointTimeVal   ].join(''));
                return ;
            }

            // var axisData = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
            // var axisData = jData.timeStr;
            var jDataPointTime = new Date(jDataPointTimeVal);

            myChart2RenderOption.title.subtext = ['[', jDataHardwareId, ']'].join('');

            var data0 = myChart2RenderOption.series[0].data;

            data0.push({
                name: jDataPointTime.toString(),
                value: [
                    laydate.now(jDataPointTime.getTime(), 'YYYY-MM-DD hh:mm:ss'),
                    Math.round(jDataFieldVal)
                ]
            });

            console.log('[device_manage_echarts.js renderUpdatedData2Charts] isNot2Render: ' + isNot2Render);
            if(!isNot2Render) {
                myChart2Render.setOption({
                    series: [
                        {
                            data: data0
                        }
                    ]
                });
            }
        }
        // init function
        function renderInitData2Charts(myChart2Render, myChart2RenderOption) {
            if(!myChart2Render || !myChart2RenderOption) {
                console.error('[renderInitData2Charts] 参数检查有误：');
                console.info(['[renderInitData2Charts] myChart2Render: ',        myChart2Render      ].join(''));
                console.info(['[renderInitData2Charts] myChart2RenderOption: ',  myChart2RenderOption].join(''));
                return ;
            }

            myChart2Render.setOption(myChart2RenderOption);
        }
        // Start: 请求服务器数据，更新左侧树
        function searchTreeList() {
            // 0. 请求相关的 url 、参数表、回调
            /*var url_allSitesAndDevices = '/site/ajax/allSitesAndDevices';
            var params_allSitesAndDevices = {};*/
            var callback_allSitesAndDevices = function(data_allSitesAndDevices) {
                console.log("查询到的所有站点设备 tree list 信息:" + JSON.stringify(data_allSitesAndDevices));
                var data_allSitesAndDevices_sitesArr = data_allSitesAndDevices.data;
                console.log('查询到的所有站点 tree list 信息 data_allSitesAndDevices_sitesArr： ' + JSON.stringify(data_allSitesAndDevices_sitesArr));
                //
                if(!data_allSitesAndDevices_sitesArr || !data_allSitesAndDevices_sitesArr.length || data_allSitesAndDevices_sitesArr.length < 1) {
                    layer.closeAll('loading');
                    layer.alert('请先添加站点信息 ^_^');
                    return ;
                }
                // Start: 触发第一个设备的 click
                var urlHardwareId = tools.getQueryString('hardwareId');
                // End  : 触发第一个设备的 click
                // Start: 测试渲染树
                layui.tree({
                    elem: '#devicesTreeList' //指定元素
                    , target: '_blank' //是否新选项卡打开（比如节点返回href才有效）
                    , click: function(item) { //点击节点回调
                        layer.msg(['当前选中设备：', item.name, '，hardwareId： ', item.hardwareId].join(''));
                        console.log(['[device_manage_echarts.js layui.tree]当前被点击选中节点名称：', item.name, '全部参数：', JSON.stringify(item)].join(''));
                        console.log(item);
                        // Start: 根据用户的点击，清空折线图，然后重新 setStationId
                        if(item && item.hardwareId) {
                            layer.load();
                            refreshECharts(item.hardwareId, item.name);
                            createDevicesTreeListNodes.renderSelectSearchDevicesOptions(item.hardwareId);
                            // 关闭所有的 loading
                            // layer.closeAll('loading');
                        }
                        // End  : 根据用户的点击，清空折线图，然后重新 setStationId
                    }
                    , nodes: createDevicesTreeListNodes(data_allSitesAndDevices_sitesArr, urlHardwareId)
                });
                // End  : 测试渲染树
                // 关闭所有的 loading
                // layer.closeAll('loading');
                // Start: 触发相应 device 节点的 click
                createDevicesTreeListNodes.triggerDeviceNodeClick(createDevicesTreeListNodes.urlHardwareId);
                // End  : 触发相应 device 节点的 click
                // Start: 刷新 search device
                createDevicesTreeListNodes.renderSelectSearchDevicesOptions();
                // End  : 刷新 search device
            };
            // 1. 打开 layer loading
            layer.load();
            // 2. $.get 请求服务器 tree list 数据，并调用回调
            // $.get(url_allSitesAndDevices, params_allSitesAndDevices, callback_allSitesAndDevices, "json");
            sitesAndDevicesTreeCacheManager.loadTreeDataAllSitesAndDevices(callback_allSitesAndDevices);
        }
        // End  : 请求服务器数据，更新左侧树
        /*function searchList(currPage) {
            console.log("开始查询设备 list 的信息 ...");
            layer.load();   // loading
            $.get(
                "/device/ajax/list/",
                {"currPage": currPage || 1, siteId: 1},
                function (data) {
                    console.log("查询到的设备 list 信息:" + JSON.stringify(data));
                    var total = data.total;
                    var page = data.page;
                    var totalPage = data.totalPage;
                    var devicesDataArr = data.data;
                    console.log(['[sites-manage searchList]total: ', total].join(''));
                    console.log(['[sites-manage searchList]page: ', page].join(''));
                    console.log(['[sites-manage searchList]totalPage: ', totalPage].join(''));
                    console.log(['[sites-manage searchList]devicesDataArr: ', JSON.stringify(devicesDataArr)].join(''));
                    // Start: 设备列表刷新
                    laytpl(devicesList.innerHTML).render(devicesDataArr, function (html) {
                        devicesListTableView.innerHTML = html;
                        layer.closeAll('loading');   //关闭所有的loading
                    });
                    // End  : 设备列表刷新

                    // Start: 触发第一个设备的 click
                    var urlHardwareId = tools.getQueryString('hardwareId');
                    var deviceTableTr;
                    if(urlHardwareId) {
                        deviceTableTr = $(['.device-table-tr[data-hardware-id=', urlHardwareId,']'].join(''));
                    }
                    if(!deviceTableTr) {
                        deviceTableTr = $('.device-table-tr:first')
                    }
                    deviceTableTr.click();
                    // End  : 触发第一个设备的 click
                },
                "json"
            );
        }*/
        // Start: 展示 layerContent_tpl 于 layer 中
        function showLayerContentTplInLayer(title, content) {
            laytpl(layerContent_tpl.innerHTML).render(content, function(html) {
                layer.open({
                    type: 1
                    , title: title
                    , area: ['400px', '300px']
                    , shadeClose: true //开启遮罩关闭
                    , maxmin: true
                    , content: html
                    , btn: ['取消', '提交']
                    , yes: function (index, layero) {
                        alert('点击了按钮 yes');
                        //按钮【按钮一】的回调
                        layer.close(index);
                        // alert("点击了按钮1");
                    }
                    , btn2: function (index, layero) {
                        alert("点击了按钮 2");
                        //按钮【按钮二】的回调
                        //return false 开启该代码可禁止点击该按钮关闭
                    }
                });
            });
        }
        // End  : 展示 layerContent_tpl 于 layer 中
        // Start: Vue 渲染列表
        // arr_sample_monitorData
        console.log('[processMonitorDataArr] vue_deviceMonitorDatasListTable 初始化');
        var vue_deviceMonitorDatasListTable = new Vue({
            el: '#siteDetailInfo',
            data: {
                monitorDataArr: []
            },
            filters: {
                capitalize: function (value) {
                    if (!value) return '';
                    value = value.toString();
                    return value.charAt(0).toUpperCase() + value.slice(1);
                },
                formatTimeStr: function(timestamp) {
                    return laydate.now(timestamp, 'YYYY-MM-DD hh:mm:ss');
                }
            }
        });
        // End  : Vue 渲染列表
        // 刷新折线图
        var myChartsArr;    // 用于记录有哪些 eChartsInstance
        var optionsArr;
        function refreshECharts(hardwareId, deviceName) {
            // var hardwareId = 's1';

            // 基于准备好的dom，初始化echarts实例
            var myChart0 = echarts.init(document.getElementById('echarts-0'));
            var myChart1 = echarts.init(document.getElementById('echarts-1'));
            var myChart2 = echarts.init(document.getElementById('echarts-2'));
            var myChart3 = echarts.init(document.getElementById('echarts-3'));
            var myChartBattery = echarts.init(document.getElementById('echarts-battery'));

            // Start: 检查 myChartsArr ，如果有元素且元素有 onClickCallbackFunc ，则都 off click
            if(myChartsArr && myChartsArr.length && myChartsArr.length > 0) {
                myChartsArr.forEach(function (item_myChart, index_myChart) {
                    if(item_myChart.onClickCallbackFunc) {
                        item_myChart.off('click', item_myChart.onClickCallbackFunc);
                    }
                });
            }
            // End  : 检查 myChartsArr ，如果有元素且元素有 onClickCallbackFunc ，则都 off click

            myChartsArr = [myChart0, myChart1, myChart2, myChart3];

            // Start: 测试绑定 click 事件给 eCharts
            if(myChartsArr && myChartsArr.length && myChartsArr.length > 0) {
                myChartsArr.forEach(function (item_myChart, index_myChart) {
                    item_myChart.onClickCallbackFunc = function() {
                        onClick2ShowCompareLayer(hardwareId, index_myChart, subTitlesArr[index_myChart], deviceName);
                    };
                    item_myChart.on('click', item_myChart.onClickCallbackFunc);
                });
            }
            // End  : 测试绑定 click 事件给 eCharts

            // 指定图表的配置项和数据
            var option0 = genOption(hardwareId, 0, deviceName);
            var option1 = genOption(hardwareId, 1, deviceName);
            var option2 = genOption(hardwareId, 2, deviceName);
            var option3 = genOption(hardwareId, 3, deviceName);
            optionsArr = [option0, option1, option2, option3];
            // Battery 电量百分比图配置项和数据
            var optionBattery = genOptionBattery(hardwareId, deviceName);

            // 实际： 监听事件进行刷新
            $(function() {
                renderInitData2Charts(myChartsArr[0], optionsArr[0]);
                renderInitData2Charts(myChartsArr[1], optionsArr[1]);
                renderInitData2Charts(myChartsArr[2], optionsArr[2]);
                renderInitData2Charts(myChartsArr[3], optionsArr[3]);
                // Battery 的 render init data to charts
                renderInitData2Charts(myChartBattery, optionBattery);

                // var oneSocketEvent = oneSocket.EVENT;
                /**
                 * 处理 monitorData
                 * @param data  monitorData
                 */
                function processMonitorData(data, isJSONObj, isNot2Render) {
                    console.log('[documentEvent oneSocketEvent] data: ');
                    console.log(data);
                    var jData = data;
                    if(!isJSONObj) {
                        jData = JSON.parse(data);
                    }
                    console.log('[documentEvent oneSocketEvent] jData: ');
                    var jDataGasEvent = jData.gasEvent;
                    console.log(jDataGasEvent);

                    // Start: 判断 hardwareId 相符，才进行刷新
                    console.info(['[documentEvent oneSocketEvent][hardwareId: ', hardwareId, '][jDataGasEvent.hardwareId: ', jDataGasEvent.hardwareId, '] 不相等？： ', hardwareId != jDataGasEvent.hardwareId].join(''));
                    if(hardwareId != jDataGasEvent.hardwareId) {
                        console.warn('[device_manage_echarts.js processMonitorData] hardwareId 不符');
                        return ;
                    }
                    // End  : 判断 hardwareId 相符，才进行刷新

                    // 判断 jDataGasEvent 的 pointtime 是否在有效时间范围内
                    if(!todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd(jDataGasEvent.pointtime)) {
                        console.warn('[device_manage_echarts.js processMonitorData] jDataGasEvent 的 pointtime 不在有效时间范围内');
                        return ;
                    }

                    renderUpdatedData2Charts(myChartsArr[0], optionsArr[0], jDataGasEvent.hardwareId, jDataGasEvent.temperature
                        , jDataGasEvent.summary, jDataGasEvent.pointtime, isNot2Render);
                    renderUpdatedData2Charts(myChartsArr[1], optionsArr[1], jDataGasEvent.hardwareId, jDataGasEvent.pressure
                        , jDataGasEvent.summary, jDataGasEvent.pointtime, isNot2Render);
                    renderUpdatedData2Charts(myChartsArr[2], optionsArr[2], jDataGasEvent.hardwareId, jDataGasEvent.standard
                        , jDataGasEvent.summary, jDataGasEvent.pointtime, isNot2Render);
                    renderUpdatedData2Charts(myChartsArr[3], optionsArr[3], jDataGasEvent.hardwareId, jDataGasEvent.running
                        , jDataGasEvent.summary, jDataGasEvent.pointtime, isNot2Render);
                    // Battery 数据更新
                    debugger;
                    renderUpdatedData2ChartsBattery(myChartBattery, optionBattery, jDataGasEvent.hardwareId
                        , jDataGasEvent.battery, isNot2Render);

                    // 向 vue_deviceMonitorDatasListTable.monitorDataArr 中推送最新数据
                    jData.deviceName = deviceName;
                    vue_deviceMonitorDatasListTable.monitorDataArr.push(jData);
                }
                oneSocket.setHandler(oneSocket.Event.GAS_EVENT, processMonitorData);
                // oneSocket.setStation(hardwareId);

                // 最后，固定 echarts 容器宽度，并指定父容器滚动
                var deviceEchartsContainerEle = $('#device-echarts-container');
                // deviceEchartsContainerEle.css('width', deviceEchartsContainerEle.width());
                deviceEchartsContainerEle.css('width', '100%');
                deviceEchartsContainerEle.parent().css('overflow-x', 'auto');
                // Start: 请求 history 信息
                /**
                 * 请求历史 monitorData ，并渲染到 eCharts
                 */
                function renderHistoryData2Charts() {
                    // 1. 请求
                    /*var params_history = {hardwareId: hardwareId, begin: laydate.now(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd.getStartTimestamp(), 'YYYY-MM-DD:hh:mm:ss')
                        , end: laydate.now(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd.getEndTimestamp(), 'YYYY-MM-DD:hh:mm:ss')};
                    var url_get_history = '/point/query/history' + tools.serializeParams(params_history);*/
                    var max_history = 1000;  // 历史测点的 max 数目
                    var callback_history = function(data_history) {
                        console.log('[device_manage_echarts.js callback_history] data_history: ');
                        console.log(data_history);
                        //
                        var code = data_history.code, msg = data_history.msg, page = data_history.page
                            , total = data_history.total, totalPage = data_history.totalPage, arr_monitorData = data_history.data;
                        console.log('[device_manage_echarts.js callback_history] code: ' + code);
                        console.log('[device_manage_echarts.js callback_history] msg: ' + msg);
                        console.log('[device_manage_echarts.js callback_history] page: ' + page);
                        console.log('[device_manage_echarts.js callback_history] total: ' + total);
                        console.log('[device_manage_echarts.js callback_history] totalPage: ' + totalPage);
                        console.log('[device_manage_echarts.js callback_history] arr_monitorData: ');
                        console.log(arr_monitorData);
                        // 处理 arr_monitorData
                        function processMonitorData_async(item_monitorData, index_monitorData, isJSONObj, isNot2Render) {
                            console.log('[device_manage_echarts.js processMonitorData_async] index_monitorData: ' + index_monitorData);
                            console.log('[device_manage_echarts.js processMonitorData_async] isNot2Render: ' + isNot2Render);
                            setTimeout(function() {
                                processMonitorData(item_monitorData, isJSONObj, isNot2Render);
                                if(!isNot2Render) {
                                    layer.closeAll('loading');   //关闭所有的loading
                                }
                            }, index_monitorData * 1);
                        }
                        function processMonitorDataArr(arr_monitorData) {
                            if(arr_monitorData && arr_monitorData.length && arr_monitorData.length > 0) {
                                // 先筛除掉 arr_monitorData 中不合格的数据（时间范围不在图中开始结束时间范围以内的）
                                var arr_filtered_monitorData = [];
                                arr_monitorData.forEach(function(item_monitorData) {
                                    if(todayStartEndDateTimeTool.checkIsTimestampBetweenStartEnd(item_monitorData.gasEvent.pointtime)) {
                                        arr_filtered_monitorData.push(item_monitorData);
                                    }
                                });
                                arr_monitorData = arr_filtered_monitorData;
                                // 先按 max_history 抽样 arr_monitorData
                                var length_arr_monitorData = arr_monitorData.length
                                    , arr_sample_monitorData = arr_monitorData;
                                if(length_arr_monitorData > max_history) {
                                    arr_sample_monitorData = [];
                                    // var step = Math.floor(length_arr_monitorData / max_history);
                                    var step = length_arr_monitorData / max_history;
                                    for(var i = 0, i_step = 0; i < length_arr_monitorData && arr_sample_monitorData.length < max_history; i = Math.round(i_step += step)) {
                                        arr_sample_monitorData.push(arr_monitorData[i]);
                                    }
                                }
                                console.log('[device_manage_echarts.js processMonitorDataArr] arr_sample_monitorData.length: ' + arr_sample_monitorData.length);
                                // Start: 对 arr_sample_monitorData 中的数据进行排序
                                arr_sample_monitorData.sort(function(a_sample_monitorData, b_sample_monitorData) {
                                    return a_sample_monitorData.gasEvent.pointtime - b_sample_monitorData.gasEvent.pointtime;
                                });
                                // End  : 对 arr_sample_monitorData 中的数据进行排序
                                arr_sample_monitorData.forEach(function(item_monitorData, index_monitorData) {
                                    var isNot2Render = !(index_monitorData + 1 === arr_sample_monitorData.length);
                                    processMonitorData_async(item_monitorData, index_monitorData, true
                                        , isNot2Render);
                                });
                                // 及时关闭 layer.loading
                                if(arr_sample_monitorData.length < 1) {
                                    layer.closeAll('loading');
                                }
                                // 统一在 processMonitorData 中处理了，这里就不再赋值 arr_sample_monitorData
                                // vue_deviceMonitorDatasListTable.monitorDataArr = arr_sample_monitorData;
                            } else {
                                // arr_monitorData 为空，需要隐藏掉 layer loading
                                layer.closeAll('loading');
                            }
                        }
                        processMonitorDataArr(arr_monitorData);
                    };
                    // 2. 发 get 请求
                    layer.load();
                    // $.get(url_get_history, {}, callback_history, 'json');
                    // 从 cache 中获取数据
                    var cachedMonitorDataArr = monitorDataCacheManager.loadCachedMonitorDataArrByHardwareId(hardwareId);
                    function adapter_4_callback_history(cachedMonitorDataArr) {
                        var data_history = {
                            code: 0
                            , msg: '从缓存加载成功'
                            , page: 1
                            , total: cachedMonitorDataArr.length
                            , totalPage: 1
                            , data: cachedMonitorDataArr
                        };
                        callback_history(data_history);
                    }
                    adapter_4_callback_history(cachedMonitorDataArr);
                }
                renderHistoryData2Charts();
                // End  : 请求 history 信息
            });
        }
        // 调用以创建 layui.tree nodes
        function createDevicesTreeListNodes(data_allSitesAndDevices_sitesArr, urlHardwareId) {
            // Start: 本 function 中所有被调用的子 function 定义
            /**
             * 创建站点的子设备
             */
            function createSiteChildrenDevices(devices) {
                console.log('[device_manage_echarts.js createDevicesTreeListNodes createSiteChildrenDevices] devices: ', JSON.stringify(devices));
                var arr_siteChildrenDevices = [];
                if(devices && devices.length && devices.length > 0) {
                    devices.forEach(function(item_device) {
                        var id = item_device.id
                            , hardwareId = item_device.hardwareId
                            , siteId = item_device.siteId
                            , name = item_device.name
                            , logic = item_device.logic
                            , children = item_device.children;
                        console.log('[device_manage_echarts.js createDevicesTreeListNodes createSiteChildrenDevices] item_device id: ' + id);
                        console.log('[device_manage_echarts.js createDevicesTreeListNodes createSiteChildrenDevices] item_device hardwareId: ' + hardwareId);
                        console.log('[device_manage_echarts.js createDevicesTreeListNodes createSiteChildrenDevices] item_device siteId: ' + siteId);
                        console.log('[device_manage_echarts.js createDevicesTreeListNodes createSiteChildrenDevices] item_device name: ' + name);
                        console.log('[device_manage_echarts.js createDevicesTreeListNodes createSiteChildrenDevices] item_device logic: ' + logic);
                        var node_siteChildrenDevice = {
                            name: name/*['[', hardwareId, ' : ', name, ']'].join('')*/, id: id
                            , hardwareId: hardwareId, alias: name, children: createSiteChildrenDevices(children)};
                        arr_siteChildrenDevices.push(node_siteChildrenDevice);
                        //
                        createDevicesTreeListNodes.arr_sitesAndDevicesNodes.push(node_siteChildrenDevice);
                    });
                }
                return arr_siteChildrenDevices;
            }
            /**
             * 检查 urlHardwareId 是否在 devices 中。
             * 0. devices 为空，则返回 null 。
             * 1. urlHardwareId 为空，则返回 firstDeviceHardwareId ; 若 firstDeviceHardwareId 为空，则返回 devices 中第一个 device 的 hardwareId 。
             * 2. urlHardwareId 非空， 检查 devices 中是否有 （hardwareId == urlHardwareId） 的 device ，有则返回 hardwareId ；否则返回空。
             * @param urlHardwareId
             * @param devices
             * @param firstDeviceHardwareId
             */
            function checkUrlHardwareIdInDevices(urlHardwareId, devices, firstDeviceHardwareId) {
                // 0. devices 为空，则返回 null 。
                if(!devices || !devices.length || !(devices.length > 0)) {
                    return null;
                }
                // 1. urlHardwareId 为空，则返回 firstDeviceHardwareId ; 若 firstDeviceHardwareId 为空，
                //    则返回 devices 中第一个 device 的 hardwareId 。
                if(!urlHardwareId) {
                    // firstDeviceHardwareId 非空则返回
                    if(firstDeviceHardwareId) {
                        return firstDeviceHardwareId;
                    }
                    // 若 firstDeviceHardwareId 为空，则返回 devices 中第一个 device 的 hardwareId 。
                    return devices[0].hardwareId;
                } else {
                    // 2. urlHardwareId 非空， 检查 devices 中是否有 （hardwareId == urlHardwareId） 的 device ，有则返回 hardwareId ；否则返回空。
                    var isUrlHardwareIdInDevices = false;
                    devices.forEach(function(item_device) {
                        if(isUrlHardwareIdInDevices) {
                            return false;   // 当 isUrlHardwareIdInDevices 为 true ，已经找到对应 hardwareId 的 device ，不用再比较
                        }
                        if(urlHardwareId == item_device.hardwareId) {
                            isUrlHardwareIdInDevices = true;
                        } else {    // 当前节点不匹配，看子节点
                            // item_device.children 为空，返回 null ; urlHardwareId 必非空，检查无匹配子节点也返回 null ；
                            // 返回具体 tmpFirstDeviceHardwareId 则有匹配
                            var tmpFirstDeviceHardwareId = checkUrlHardwareIdInDevices(urlHardwareId,
                                item_device.children, firstDeviceHardwareId);
                            if(tmpFirstDeviceHardwareId && tmpFirstDeviceHardwareId == urlHardwareId) {
                                isUrlHardwareIdInDevices = true;
                            }
                        }
                    });
                    // 有则返回 hardwareId ；否则返回空
                    if(isUrlHardwareIdInDevices) {
                        return urlHardwareId;
                    } else {
                        return null;
                    }
                }
            }
            /**
             * 检查 urlHardwareId 是否在 data_allSitesAndDevices_sitesArr 中的 devices 中，若不在则赋予第一个 device 的 hardwareId
             */
            function checkUrlHardwareId(urlHardwareId, data_allSitesAndDevices_sitesArr) {
                // Start: 本 function 中所有被调用的 function

                // End  : 本 function 中所有被调用的 function
                var firstDeviceHardwareId = null;
                if(data_allSitesAndDevices_sitesArr && data_allSitesAndDevices_sitesArr.length
                    && data_allSitesAndDevices_sitesArr.length > 0) {
                    data_allSitesAndDevices_sitesArr.forEach(function(item_site) {
                        var devices = item_site.devices;
                        var tmpFirstDeviceHardwareId = checkUrlHardwareIdInDevices(urlHardwareId, devices, firstDeviceHardwareId);
                        // 如果 tmpFirstDeviceHardwareId 为 null ，则 urlHardwareId 不在当前这组 devices 里
                        // 否则，可能 urlHardwareId 和 firstDeviceHardwareId 都为 null ，返回的值是一个保底值先赋值给 firstDeviceHardwareId
                        if(tmpFirstDeviceHardwareId) {
                            firstDeviceHardwareId = tmpFirstDeviceHardwareId;
                        }
                    });
                    // 检查 urlHardwareId 如果为空，则把 firstDeviceHardwareId 赋值给它
                    if(!urlHardwareId) {
                        urlHardwareId = firstDeviceHardwareId;
                    } else {
                        // urlHardwareId 存在，但 firstDeviceHardwareId 不存在，说明没找到过 urlHardwareId 对应的 device ，
                        // 则 urlHardwareId 重新赋值为新找的 firstDeviceHardwareId
                        if(!firstDeviceHardwareId) {
                            urlHardwareId = firstDeviceHardwareId = checkUrlHardwareIdInDevices(urlHardwareId = null,
                                data_allSitesAndDevices_sitesArr[0].devices, firstDeviceHardwareId);
                        }
                    }
                } else {    // 相当于 urlHardwareId = null , 因为此时 data_allSitesAndDevices_sitesArr 为空
                    urlHardwareId = firstDeviceHardwareId;
                }

                return urlHardwareId;
            }

            /**
             * 判断当前 treeNode 是否展开。
             */
            function judgeIsTreeNodeSpread(devices, urlHardwareId) {
                // Start: 此 function 中使用的 function 定义

                // End  : 此 function 中使用的 function 定义
                if(!devices || !devices.length || !(devices.length > 0)) {
                    return false;   // 没有 devices 子节点，不需要展开
                }
                // 有 devices 子节点，检查 urlHardwareId 是否在子节点里
                var firstDeviceHardwareId = null;
                firstDeviceHardwareId = checkUrlHardwareIdInDevices(urlHardwareId, devices, firstDeviceHardwareId);
                return !!firstDeviceHardwareId;
            }
            // End  : 本 function 中所有被调用的子 function 定义
            // Start: 检查 urlHardwareId 是否在 data_allSitesAndDevices_sitesArr 中的 devices 中，若不在则赋予第一个 device 的 hardwareId
            urlHardwareId = checkUrlHardwareId(urlHardwareId, data_allSitesAndDevices_sitesArr);
            // End  : 检查 urlHardwareId 是否在 data_allSitesAndDevices_sitesArr 中的 devices 中，若不在则赋予第一个 device 的 hardwareId
            // Start: 用于记录 deviceNode 的 index 和 具体 node 间映射
            createDevicesTreeListNodes.arr_sitesAndDevicesNodes = [];
            createDevicesTreeListNodes.urlHardwareId = urlHardwareId;
            // End  : 用于记录 deviceNode 的 index 和 具体 node 间映射
            var devicesTreeListNodes = [];
            if(data_allSitesAndDevices_sitesArr && data_allSitesAndDevices_sitesArr.length
                && data_allSitesAndDevices_sitesArr.length > 0) {
                data_allSitesAndDevices_sitesArr.forEach(function(siteItem) {
                    var id = siteItem.id
                        , name = siteItem.name
                        , devices = siteItem.devices;
                    console.log('[device_manage_echarts.js createDevicesTreeListNodes] id: ' + id);
                    console.log('[device_manage_echarts.js createDevicesTreeListNodes] name: ' + name);
                    console.log('[device_manage_echarts.js createDevicesTreeListNodes] devices: ' + JSON.stringify(devices));
                    //
                    var deviceTreeListNode = {
                        name: name
                        , id: id
                        , alias: name
                        // , children: createSiteChildrenDevices(devices)
                        , spread: judgeIsTreeNodeSpread(devices, urlHardwareId)
                    };
                    // Start: 这里 arr_sitesAndDevicesNodes push 必须在 createSiteChildrenDevices 前
                    createDevicesTreeListNodes.arr_sitesAndDevicesNodes.push(deviceTreeListNode);
                    deviceTreeListNode.children = createSiteChildrenDevices(devices);
                    // End  : 这里 arr_sitesAndDevicesNodes push 必须在 createSiteChildrenDevices 前
                    devicesTreeListNodes.push(deviceTreeListNode);
                });
            }
            return devicesTreeListNodes/* || [ //节点
            {
                name: 'device-1'
                ,id: 1
                ,alias: 'device-1'
                ,children: [
                {
                    name: 'device-1-1'
                    ,id: 11
                    ,href: 'http://www.layui.com/'
                    ,alias: 'device-1-1'
                }, {
                    name: 'device-1-2'
                    ,id: 12
                }, {
                    name: 'device-1-3'
                    ,id: 13
                }
            ]
            }, {
                name: 'device-2'
                ,id: 2
                ,spread: true
                ,children: [
                    {
                        name: 'device-2-1'
                        ,id: 21
                        ,spread: true
                        ,children: [
                        {
                            name: 'device-2-1-1'
                            ,id: 211
                            ,children: [
                            {
                                name: 'device-2-1-1-1'
                                ,id: 2111
                            }, {
                                name: 'device-2-1-1-2'
                                ,id: 2112
                            }, {
                                name: 'device-2-1-1-3'
                                ,id: 2113
                            }
                        ]
                        }, {
                            name: 'device-2-1-2'
                            ,id: 212
                        }, {
                            name: 'device-2-1-3'
                            ,id: 213
                        }
                    ]
                    }, {
                        name: 'device-2-2'
                        ,id: 22
                        ,children: [
                            {
                                name: 'device-2-2-1'
                                ,id: 221
                            }, {
                                name: 'device-2-2-2'
                                ,id: 222
                            }, {
                                name: 'device-2-2-3'
                                ,id: 223
                            }
                        ]
                    }
                ]
            }
            ,{
                name: 'device-3'
                ,id: 3
                ,alias: 'device-3'
                ,children: [
                    {
                        name: 'device-3-1'
                        ,id: 31
                        ,alias: 'device-3-1'
                    }, {
                        name: 'device-3-2'
                        ,id: 12
                        ,children: [
                            {
                                name: 'device-3-2-1'
                                ,id: 121
                            }
                            ,{
                                name: 'device-3-2-2'
                                ,id: 122
                            }
                        ]
                    }
                ]
            }
        ]*/;
        }
        createDevicesTreeListNodes.triggerDeviceNodeClick = function(urlHardwareId) {
            var arr_sitesAndDevicesNodes = createDevicesTreeListNodes.arr_sitesAndDevicesNodes;
            if(!arr_sitesAndDevicesNodes || !arr_sitesAndDevicesNodes.length || !(arr_sitesAndDevicesNodes.length > 0)) {
                return ;
            }
            arr_sitesAndDevicesNodes.forEach(function (item_deviceNode, index_deviceNode) {
                if(urlHardwareId != item_deviceNode.hardwareId) {
                    return ;
                }
                var arr_element_as = $('#devicesTreeList a');
                if(!arr_element_as || !arr_element_as.length || !(arr_element_as.length > index_deviceNode)) {
                    return ;
                }
                arr_element_as[index_deviceNode].click();
            });
        };
        createDevicesTreeListNodes.renderSelectSearchDevicesOptions = function(selectedHardwareId) {
            var arr_sitesAndDevicesNodes = createDevicesTreeListNodes.arr_sitesAndDevicesNodes;
            if(arr_sitesAndDevicesNodes && arr_sitesAndDevicesNodes.length && arr_sitesAndDevicesNodes.length > 0) {
                var arr_devicesNodes = [];
                arr_sitesAndDevicesNodes.forEach(function(item_siteOrDeviceNode) {
                    if(item_siteOrDeviceNode.hardwareId) {
                        arr_devicesNodes.push(item_siteOrDeviceNode);
                    }
                });
                if(arr_devicesNodes.length < 1) {
                    $('#select-search_device').html('<option value="-1">--- 没有设备 ---</option>');
                } else {
                    var arr_options_devices = [];
                    arr_devicesNodes.forEach(function(item_deviceNode) {
                        arr_options_devices.push([
                            '<option value="'
                            , item_deviceNode.hardwareId
                            , '"'
                            , ((selectedHardwareId && selectedHardwareId == item_deviceNode.hardwareId) ? ' selected' : '')
                            , '>'
                            , item_deviceNode.name
                            , '</option>'].join(''));
                    });
                    $('#select-search_device').html(arr_options_devices.join(''));
                }
                form.render();
            }
        };
        // End  : 所有被本模块调用的函数定义在此

        //第一次加载数据
        // searchList();
        // 第一次加载左侧 tree list 数据
        $(function() {
            searchTreeList();
        });

        // Start: [设备列表]中某设备被点击
        /*$(document).on('click', '.device-table-tr', function() {
            var thisTr = $(this);
            // 获取当前行的设备信息
            var deviceId = thisTr.data('id');
            var hardwareId = thisTr.data('hardwareId');
            var tokenId = thisTr.data('tokenId');
            var deviceName = thisTr.data('name');
            var logic = thisTr.data('logic');
            var watcher = thisTr.data('watcher');
            var phone = thisTr.data('phone');
            var created = thisTr.data('created');
            var status = thisTr.data('status');
            var parent = thisTr.data('parent');
            var siteId = thisTr.data('siteId');
            // Start: 被选中的 tr addClass 以区分
            var siteTrSelectedClassStr = 'site-tr-selected';
            $('.device-table-tr').removeClass(siteTrSelectedClassStr);
            thisTr.addClass(siteTrSelectedClassStr);
            // End  : 被选中的 tr addClass 以区分
            //
            console.log(['设备信息[deviceId: ', deviceId, '][hardwareId: ', hardwareId, '][tokenId: ', tokenId, '][deviceName: ', deviceName, '][logic: ', logic,
                '][watcher: ', watcher, '][phone: ', phone, '][created: ', created, '][status: ', status, '][parent: ', parent, '][siteId: ', siteId, ']'].join(''));
            // Start: 根据用户的点击，清空折线图，然后重新 setStationId
            refreshECharts(hardwareId, deviceName);
            // End  : 根据用户的点击，清空折线图，然后重新 setStationId
        });*/
        // End  : [设备列表]中某设备被点击

        // Start: 绑定窗口的 resize 事件
        var timerId_resize;
        $(window).on('resize', function() {
            if(myChartsArr && myChartsArr.length && myChartsArr.length > 0) {
                console.log('[device_manage_echarts.js] triggered resize function out');
                if(timerId_resize) {
                    clearInterval(timerId_resize);
                }
                timerId_resize = setTimeout(function() {
                    console.log('[device_manage_echarts.js] triggered resize function inner');
                    myChartsArr.forEach(function(myChartItem) {
                        myChartItem.resize();
                    });
                }, 100);
            }
        });
        // End  : 绑定窗口的 resize 事件

        // Start: 绑定 search device select 的选项被点击事件
        form.on('select(search-device)', function(data){
            console.log(data.elem); //得到select原始DOM对象
            console.log(data.value); //得到被选中的值
            console.log(data.othis); //得到美化后的DOM对象
            //
            var hardwareId = data.value;
            createDevicesTreeListNodes.triggerDeviceNodeClick(hardwareId);
        });
        // End  : 绑定 search device select 的选项被点击事件
    });
})();