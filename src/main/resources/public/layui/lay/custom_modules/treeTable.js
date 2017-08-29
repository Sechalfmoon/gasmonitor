/*!
 * treeTable.js v0.1.0
 * (c) 2017 Payne Pandaroid Wang
 * 封装 jquery.treetable
 */
layui.define(['jquery'], function(exports) {
    var jQuery = layui.jquery
        , $ = jQuery;

    console.log('【layui.treeTable】加载完毕后执行回调');

    // Start: treeTable 源码
    !function($){var Node,Tree,methods;Node=function(){function Node(row,tree,settings){var parentId;this.row=row,this.tree=tree,this.settings=settings,this.id=this.row.data(this.settings.nodeIdAttr),parentId=this.row.data(this.settings.parentIdAttr),null!=parentId&&""!==parentId&&(this.parentId=parentId),this.treeCell=$(this.row.children(this.settings.columnElType)[this.settings.column]),this.expander=$(this.settings.expanderTemplate),this.indenter=$(this.settings.indenterTemplate),this.children=[],this.initialized=!1,this.treeCell.prepend(this.indenter)}return Node.prototype.addChild=function(child){return this.children.push(child)},Node.prototype.ancestors=function(){var ancestors,node;for(node=this,ancestors=[];node=node.parentNode();)ancestors.push(node);return ancestors},Node.prototype.collapse=function(){return this.collapsed()?this:(this.row.removeClass("expanded").addClass("collapsed"),this._hideChildren(),this.expander.attr("title",this.settings.stringExpand),this.initialized&&null!=this.settings.onNodeCollapse&&this.settings.onNodeCollapse.apply(this),this)},Node.prototype.collapsed=function(){return this.row.hasClass("collapsed")},Node.prototype.expand=function(){return this.expanded()?this:(this.row.removeClass("collapsed").addClass("expanded"),this.initialized&&null!=this.settings.onNodeExpand&&this.settings.onNodeExpand.apply(this),$(this.row).is(":visible")&&this._showChildren(),this.expander.attr("title",this.settings.stringCollapse),this)},Node.prototype.expanded=function(){return this.row.hasClass("expanded")},Node.prototype.hide=function(){return this._hideChildren(),this.row.hide(),this},Node.prototype.isBranchNode=function(){return this.children.length>0||this.row.data(this.settings.branchAttr)===!0?!0:!1},Node.prototype.updateBranchLeafClass=function(){this.row.removeClass("branch"),this.row.removeClass("leaf"),this.row.addClass(this.isBranchNode()?"branch":"leaf")},Node.prototype.level=function(){return this.ancestors().length},Node.prototype.parentNode=function(){return null!=this.parentId?this.tree[this.parentId]:null},Node.prototype.removeChild=function(child){var i=$.inArray(child,this.children);return this.children.splice(i,1)},Node.prototype.render=function(){var handler,target,settings=this.settings;return settings.expandable===!0&&this.isBranchNode()&&(handler=function(e){return $(this).parents("table").treetable("node",$(this).parents("tr").data(settings.nodeIdAttr)).toggle(),e.preventDefault()},this.indenter.html(this.expander),target=settings.clickableNodeNames===!0?this.treeCell:this.expander,target.off("click.treetable").on("click.treetable",handler),target.off("keydown.treetable").on("keydown.treetable",function(e){13==e.keyCode&&handler.apply(this,[e])})),this.indenter[0].style.paddingLeft=""+this.level()*settings.indent+"px",this},Node.prototype.reveal=function(){return null!=this.parentId&&this.parentNode().reveal(),this.expand()},Node.prototype.setParent=function(node){return null!=this.parentId&&this.tree[this.parentId].removeChild(this),this.parentId=node.id,this.row.data(this.settings.parentIdAttr,node.id),node.addChild(this)},Node.prototype.show=function(){return this.initialized||this._initialize(),this.row.show(),this.expanded()&&this._showChildren(),this},Node.prototype.toggle=function(){return this.expanded()?this.collapse():this.expand(),this},Node.prototype._hideChildren=function(){var child,_i,_len,_ref,_results;for(_ref=this.children,_results=[],_i=0,_len=_ref.length;_len>_i;_i++)child=_ref[_i],_results.push(child.hide());return _results},Node.prototype._initialize=function(){var settings=this.settings;return this.render(),settings.expandable===!0&&"collapsed"===settings.initialState?this.collapse():this.expand(),null!=settings.onNodeInitialized&&settings.onNodeInitialized.apply(this),this.initialized=!0},Node.prototype._showChildren=function(){var child,_i,_len,_ref,_results;for(_ref=this.children,_results=[],_i=0,_len=_ref.length;_len>_i;_i++)child=_ref[_i],_results.push(child.show());return _results},Node}(),Tree=function(){function Tree(table,settings){this.table=table,this.settings=settings,this.tree={},this.nodes=[],this.roots=[]}return Tree.prototype.collapseAll=function(){var node,_i,_len,_ref,_results;for(_ref=this.nodes,_results=[],_i=0,_len=_ref.length;_len>_i;_i++)node=_ref[_i],_results.push(node.collapse());return _results},Tree.prototype.expandAll=function(){var node,_i,_len,_ref,_results;for(_ref=this.nodes,_results=[],_i=0,_len=_ref.length;_len>_i;_i++)node=_ref[_i],_results.push(node.expand());return _results},Tree.prototype.findLastNode=function(node){return node.children.length>0?this.findLastNode(node.children[node.children.length-1]):node},Tree.prototype.loadRows=function(rows){var node,row,i;if(null!=rows)for(i=0;i<rows.length;i++)row=$(rows[i]),null!=row.data(this.settings.nodeIdAttr)&&(node=new Node(row,this.tree,this.settings),this.nodes.push(node),this.tree[node.id]=node,null!=node.parentId&&this.tree[node.parentId]?this.tree[node.parentId].addChild(node):this.roots.push(node));for(i=0;i<this.nodes.length;i++)node=this.nodes[i].updateBranchLeafClass();return this},Tree.prototype.move=function(node,destination){var nodeParent=node.parentNode();return node!==destination&&destination.id!==node.parentId&&-1===$.inArray(node,destination.ancestors())&&(node.setParent(destination),this._moveRows(node,destination),1===node.parentNode().children.length&&node.parentNode().render()),nodeParent&&nodeParent.updateBranchLeafClass(),node.parentNode()&&node.parentNode().updateBranchLeafClass(),node.updateBranchLeafClass(),this},Tree.prototype.removeNode=function(node){return this.unloadBranch(node),node.row.remove(),null!=node.parentId&&node.parentNode().removeChild(node),delete this.tree[node.id],this.nodes.splice($.inArray(node,this.nodes),1),this},Tree.prototype.render=function(){var root,_i,_len,_ref;for(_ref=this.roots,_i=0,_len=_ref.length;_len>_i;_i++)root=_ref[_i],root.show();return this},Tree.prototype.sortBranch=function(node,sortFun){return node.children.sort(sortFun),this._sortChildRows(node),this},Tree.prototype.unloadBranch=function(node){var i,children=node.children.slice(0);for(i=0;i<children.length;i++)this.removeNode(children[i]);return node.children=[],node.updateBranchLeafClass(),this},Tree.prototype._moveRows=function(node,destination){var i,children=node.children;for(node.row.insertAfter(destination.row),node.render(),i=children.length-1;i>=0;i--)this._moveRows(children[i],node)},Tree.prototype._sortChildRows=function(parentNode){return this._moveRows(parentNode,parentNode)},Tree}(),methods={init:function(options,force){var settings;return settings=$.extend({branchAttr:"ttBranch",clickableNodeNames:!1,column:0,columnElType:"td",expandable:!1,expanderTemplate:"<a href='#'>&nbsp;</a>",indent:19,indenterTemplate:"<span class='indenter'></span>",initialState:"collapsed",nodeIdAttr:"ttId",parentIdAttr:"ttParentId",stringExpand:"Expand",stringCollapse:"Collapse",onInitialized:null,onNodeCollapse:null,onNodeExpand:null,onNodeInitialized:null},options),this.each(function(){var tree,el=$(this);return(force||void 0===el.data("treetable"))&&(tree=new Tree(this,settings),tree.loadRows(this.rows).render(),el.addClass("treetable").data("treetable",tree),null!=settings.onInitialized&&settings.onInitialized.apply(tree)),el})},destroy:function(){return this.each(function(){return $(this).removeData("treetable").removeClass("treetable")})},collapseAll:function(){return this.data("treetable").collapseAll(),this},collapseNode:function(id){var node=this.data("treetable").tree[id];if(!node)throw new Error("Unknown node '"+id+"'");return node.collapse(),this},expandAll:function(){return this.data("treetable").expandAll(),this},expandNode:function(id){var node=this.data("treetable").tree[id];if(!node)throw new Error("Unknown node '"+id+"'");return node.initialized||node._initialize(),node.expand(),this},loadBranch:function(node,rows){var settings=this.data("treetable").settings,tree=this.data("treetable").tree;if(rows=$(rows),null==node)this.append(rows);else{var lastNode=this.data("treetable").findLastNode(node);rows.insertAfter(lastNode.row)}return this.data("treetable").loadRows(rows),rows.filter("tr").each(function(){tree[$(this).data(settings.nodeIdAttr)].show()}),null!=node&&node.render().expand(),this},move:function(nodeId,destinationId){var destination,node;return node=this.data("treetable").tree[nodeId],destination=this.data("treetable").tree[destinationId],this.data("treetable").move(node,destination),this},node:function(id){return this.data("treetable").tree[id]},removeNode:function(id){var node=this.data("treetable").tree[id];if(!node)throw new Error("Unknown node '"+id+"'");return this.data("treetable").removeNode(node),this},reveal:function(id){var node=this.data("treetable").tree[id];if(!node)throw new Error("Unknown node '"+id+"'");return node.reveal(),this},sortBranch:function(node,columnOrFunction){var sortFun,settings=this.data("treetable").settings;return columnOrFunction=columnOrFunction||settings.column,sortFun=columnOrFunction,$.isNumeric(columnOrFunction)&&(sortFun=function(a,b){var extractValue,valA,valB;return extractValue=function(node){var val=node.row.find("td:eq("+columnOrFunction+")").text();return $.trim(val).toUpperCase()},valA=extractValue(a),valB=extractValue(b),valB>valA?-1:valA>valB?1:0}),this.data("treetable").sortBranch(node,sortFun),this},unloadBranch:function(node){return this.data("treetable").unloadBranch(node),this}},$.fn.treetable=function(method){return methods[method]?methods[method].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof method&&method?$.error("Method "+method+" does not exist on jQuery.treetable"):methods.init.apply(this,arguments)},this.TreeTable||(this.TreeTable={}),this.TreeTable.Node=Node,this.TreeTable.Tree=Tree}(jQuery);
    // End  : treeTable 源码

    // Start: 所有的 function

    // End  : 所有的 function

    // Start: 依赖的 css
    layui.addcss("custom_modules/treeTable/jquery.treetable.min.css", function(){}, "jqueryTreeTableMinCss");
    layui.addcss("custom_modules/treeTable/jquery.treetable.theme.default.min.css", function(){}, "jqueryTreeTableThemeDefaultMinCss");
    // End  : 依赖的 css

    // 导出的模块名和接口函数
    exports('treeTable', {
        $: $
        , jquery: $
        , jQuery: $
    });
});