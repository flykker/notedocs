Ext.ns('app');
app.api = {
    fileUpload: function(t,id){
        var form = Ext.get(t).findParent('form');
        var al = Ext.fly(form).findParent('.attach-list');
        var b = Ext.fly(al).child('.button');

        if(t.value !== ""){
            b.dom.innerHTML = "Загрузить файл";
            Ext.fly(t).setStyle("z-index","-1");
            b.on("click", function(){
                this.fileSend(id,form,b);
            }, this)
        }
    },
    fileSend: function(id,f,b){
        Ext.Ajax.request({
            url:"/api/",
            form: f,
            params: 'method=attach&page='+id,
            callback: function(){
                 window.location.reload();
            }
        })
    },
    fileDelete: function(id){
        Ext.Ajax.request({
            url:"/api/?method=attach.del&id="+id,
            method: 'get',
            callback: function(){
                 window.location.reload();
            }
        })
    }
}

var G=Ext.get;
var TabPanel;
var pageMenu = function(){
    var el = G('context');

    this.content.on('contextmenu', function(ev,t){
        var id = this.activeTab.id.split('tab-tree')[1];
        if(this.activeContent.id == "pagedash" ){ return false;}
        el.setTop(ev.getPageY()).setLeft(ev.getPageX() - this.content.getLeft());

        el.show().focus();


        G('pageedit').on("click", function(){ el.hide(); window.location="/edit/" + id })
        G('pageadd').on("click", function(){ el.hide(); window.location="/add/" + id })
        G('pagedel').on("click", function(){ el.hide(); window.location="/del/" + id })

        return false;
    }, this, {preventDefault:true})

    el.on('blur', function(){ this.hide(); });
}

Ext.onReady(function() {

    var tree = app.tree = new Ext.Tree({
        id:'tree',
        listeners: {
            "select": function(e){
                var id = e.id.split('tree')[1];
                var tab = G('tab-'+e.id);
                if( tab !== null){
                    app.tabs.add(tab.ref);
                }else{
                    var el = app.tabs.add({
                        id: 'tab-'+e.id,
                        title: e.dom.innerHTML,
                        load: {
                            url: '/view/'+id+'/',
                            params: '',
                            id: 'page-tree'+id,
                            callback: function(){
                                el.html = G('page-tree'+id);
                                app.tabs.setPageActive();
                                app.tabs.setActiveTab(el);
                                app.tabs.setCook();
                            }
                        }
                    });
                }
            }
        }
    });

    TabPanel = Ext.extend(Ext.Tabs, {
        id: "doctab",
        activeTab: 0,
        contentEl: 'content',
        plugins: [pageMenu],

        els:[{
            title: 'Dashboard',
            closeable: false,
            htmlEl: 'pagedash'
        }],
        constructor: function(){
            TabPanel.superclass.constructor.call(this);
            this.initCook();
            this.initActiveTab();
            this.setCook();
        },

        listeners: {
            "click": function(e){
                if(e.tab.id == 'tab0'){return false;}
                tree.setActive(e.tab.id.split('tab-')[1]);
                tree.showActive();
                Ext.util.Cookies.set('activetab', e.tab.id );

                if(!e.html){
                    var me =this;
                    var id = e.tab.id.split('tab-tree')[1];
                    this.htmlLoad({
                        url: '/view/'+id+'/',
                        id: 'page-tree'+id,
                        callback: function(){
                            e.html = G('page-tree'+id);
                            me.setPageActive();
                        }
                    })
                }
            },
            "remove": function(){
                this.setCook();
            }
        },

        setCook: function(){
            var ot=[];
            Ext.each(this.els, function(){
                ot.push(this.tab.id);
            })
            Ext.util.Cookies.set('opentabs', ot.toString() );
        },

        initCook: function(){
            var me = this;
            var c = Ext.util.Cookies.get('opentabs') || '';
            var cook = c.split(',');
            if(cook.length > 1){
                Ext.each(cook, function(id){
                    var e = G('tree'+id.split('tab-tree')[1] );

                    if(e !== null){
                        var el = me.add({
                            id: 'tab-'+e.id,
                            title: e.dom.innerHTML
                        });
                    }

                })
            }

        },
        initActiveTab: function(){
            var me=this;
            var at = Ext.util.Cookies.get('activetab') || '';
            var a = Ext.get(at);

            var callback = function (){
                a.ref.html = G('page-tree'+id);
                me.setPageActive();
                me.setActiveTab(a.ref);
            }

            if(a !== null){
                if(!a.ref.html){
                    var id = a.id.split('tab-tree')[1];
                    this.htmlLoad({ url: '/view/'+id+'/', id: 'page-tree'+id, callback: callback })
                }
            }
        }
    })

    app.tabs = new TabPanel();

    var menu = app.menu = Ext.get("menu").on("click", function(){
        var e = this.child('.sett');
        var m = this.child('.menu');
        if( !e.hasClass("setthover") ){
            e.toggleClass("setthover");
        }
        m.show();
        m.focus();

        m.on("blur", function(ev,t){
            if( e.hasClass("setthover") ){
                e.toggleClass("setthover");
            }
            this.hide();
        },null,{delay:150})

    })


    app.view = new Ext.Layout({
        items: [{
            pos: 'left',
            width: 260,
            el: 'left'
        },{
            pos: 'center',
            el: 'center'
        }],

        onResize: function(){
            var e = Ext.get("center");
            var l = Ext.get("left");
            app.tabs.content.setStyle({
                overflow: "auto",
                position: "absolute",
                height: (e.getHeight() - app.tabs.el.getHeight() ) + "px",
                width: "100%"
            })
            app.tabs.tabResize();

            if(l.isStyle('display','none')){
                l.setStyle({display:'none'});
                Ext.get('show-lbar').setStyle({display:"none"});
                e.setStyle({left:0+'px', width: Ext.lib.Dom.getViewWidth()+'px'});
                Ext.get('show-lbar').setStyle({display:"block"});
                Ext.get("lresize").setStyle({left:''})
            }
        },

        onRender: function(){
            tree.body.setHeight( Ext.get('left').getHeight() - Ext.get('left').child('.top-left').getHeight() )
            Ext.get("hide-lbar").on("click", function(){
                Ext.get("left").setStyle({display:'none'});
                var c = Ext.get("center");
                c.setStyle({left:0+'px', width: Ext.lib.Dom.getViewWidth()+'px'});
                Ext.get('show-lbar').setStyle({display:"block"});
                Ext.get("lresize").setStyle({left:''})
            })

            Ext.get("show-lbar").on("click", function(){
                Ext.get("left").setStyle({display:'block'});
                Ext.get('show-lbar').setStyle({display:"none"});
                app.view.setBody();
                Ext.get("lresize").setStyle({left:''})
            })
        },

        listeners: {
            resize: function(){
                this.onResize();
            },
            onRender: function(){
                this.onRender();
            }
        }
    });

    Ext.get('content').on("click", function(ev,t){
        if(Ext.fly(t).hasClass('attach')){
            var c = Ext.fly(t).findParent('div.text');
            var al = Ext.fly(c).next();
            Ext.fly(c).hide();
            al.show();
        }

        if(Ext.fly(t).hasClass('back')){
            var al = Ext.fly(t).findParent('div.attach-list');
            var text = Ext.fly(al).prev();
            Ext.fly(al).hide();
            text.show();
        }
    });

});