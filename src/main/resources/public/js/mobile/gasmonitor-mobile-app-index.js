// Dom7
var $$ = Dom7;

// Framework7 App main instance
var app  = new Framework7({
    root: '#app', // App root element
    id: 'com.gasmonitor.index', // App bundle ID
    name: '监控平台', // App name
    theme: 'auto', // Automatic theme detection
    // App root data
    data: function () {
        return {
            user: {
                firstName: 'John',
                lastName: 'Doe',
            },
            // Demo products for Catalog section
            products: [
                {
                    id: '1',
                    title: 'Apple iPhone 8',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi tempora similique reiciendis, error nesciunt vero, blanditiis pariatur dolor, minima sed sapiente rerum, dolorem corrupti hic modi praesentium unde saepe perspiciatis.'
                },
                {
                    id: '2',
                    title: 'Apple iPhone 8 Plus',
                    description: 'Velit odit autem modi saepe ratione totam minus, aperiam, labore quia provident temporibus quasi est ut aliquid blanditiis beatae suscipit odio vel! Nostrum porro sunt sint eveniet maiores, dolorem itaque!'
                },
                {
                    id: '3',
                    title: 'Apple iPhone X',
                    description: 'Expedita sequi perferendis quod illum pariatur aliquam, alias laboriosam! Vero blanditiis placeat, mollitia necessitatibus reprehenderit. Labore dolores amet quos, accusamus earum asperiores officiis assumenda optio architecto quia neque, quae eum.'
                },
            ]
        };
    },
    // App root methods
    methods: {
        helloWorld: function () {
            app.dialog.alert('Hello World!');
        },
    },
    // App routes
    routes: routes_index
});

// Init/Create views
var homeView = app.views.create('#view-home', {
    url: '/'
});
var catalogView = app.views.create('#view-catalog', {
    url: '/catalog/'
});
var settingsView = app.views.create('#view-settings', {
    url: '/settings/'
});


// Login Screen Demo
$$('#my-login-screen .login-button').on('click', function () {
    var username = $$('#my-login-screen [name="username"]').val();
    var password = $$('#my-login-screen [name="password"]').val();

    // Close login screen
    app.loginScreen.close('#my-login-screen');

    // Alert username and password
    app.dialog.alert('Username: ' + username + '<br>Password: ' + password);
});

// Start: vue_index
var vue_panelLeft = new Vue({
    el: '#gm-page-panel_left',
    data: {},
    methods: {
        onClick_menuItemRoute: function(routePath) {
            /*app.dialog.alert('[onClick_menuItemRoute] routePath: ' + routePath, '菜单路由', function() {
                app.panel.left.close();
                homeView.router.navigate(routePath);
            });*/
            app.panel.left.close();
            homeView.router.navigate(routePath);
        }
    }
});
// End  : vue_index

// Start: 站点详情 - 地图
$$(document).on('page:afterin', '.page[data-name="site_sites_manage"]', function (e) {
    // app.dialog.alert('page site_sites_manage afterin');
    // 百度地图API功能
    var map = new BMap.Map("sites-show-map", {enableMapClick: false});  // 创建Map实例
    var pointChengDu = new BMap.Point(104.072, 30.663);
    // map.centerAndZoom("成都", 12);      // 初始化地图,用城市名设置地图中心点
    map.centerAndZoom(pointChengDu, 12);      // 初始化地图,用城市名设置地图中心点
    map.enableScrollWheelZoom(true);  // 启用缩放
}).on('page:afterin', '.page[data-name="device_devices_manage"]', function (e) {
    app.dialog.alert('page device_devices_manage afterin');
    var myChart0 = echarts.init(document.getElementById('echarts-0'));
    var option0 = {
        tooltip : {
            trigger: 'axis'
        },
        legend: {
            data:['温度']
        },
        toolbox: {
            show : true,
            feature : {
                mark : {show: true},
                dataView : {show: true, readOnly: true},
                saveAsImage : {show: true}
            }
        },
        calculable : true,
        xAxis : [
            {
                type : 'category',
                boundaryGap : false,
                data : ['8:00','12:00','16:00','20:00','24:00','4:00','8:00']
            }
        ],
        yAxis : [
            {
                type : 'value'
            }
        ],
        series : [
            {
                name:'温度',
                type:'line',
                stack: '总量',
                data:[120, 132, 101, 134, 90, 230, 210]
            }
        ]
    };
    myChart0.setOption(option0);
});
// End  : 站点详情 - 地图