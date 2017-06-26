layui.use(['layer', 'element'], function () {
    var element = layui.element();
    var layer = layui.layer;
    var $ = layui.jquery;

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
        var title = a.text();
        var src = elem.children('a').attr('data-url');
        var id = elem.children('a').attr('data-id');
        var iframe = tabcontent.find('iframe[data-id=' + id + ']').eq(0);
        var tabindex = tabtitle.children('li').length;

        if (src != undefined && src != null && id != undefined && id != null) {
            if (iframe.length) { //存在 iframe
                //获取iframe身上的tab index
                tabindex = iframe.attr('data-tabindex');
            } else { //不存在 iframe
                //显示加载层
                layer.load();
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
    nav.find('li').eq(0).click();
});