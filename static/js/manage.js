Ext.ns('app','api');

if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

Ext.Msg = Ext.extend(Ext.util.Observable, {
    html: null,
    delay: 1000,
    cls:'',

    constructor: function(config){
        Ext.apply(this, config)
        Ext.Msg.superclass.constructor.call(this);

        this.init();
    },
    init: function(){
        this.el = Ext.getBody().createChild({cls:'msg'});
        this.body = this.el.createChild({cls:'msg-body '+this.cls,});

        if(this.html)
            this.body.dom.innerHTML = this.html;
    },
    show: function(){
        var me = this;
        this.el.show();
        new Ext.util.DelayedTask(function(){
            me.el.fadeOut({ callback: me.callback, scope:me });
        }).delay(this.delay);
    },
    callback: function(){
        this.el.remove();
    }
})

api.get = function(cfg){
    Ext.Ajax.request({
        url: '/api/?method='+cfg.method,
        method:'get',
        params: cfg.params || '',
        success:function(response, opts){
            var res = Ext.decode(response.responseText);
            if(res.request)
                new Ext.Msg({html:'<b>OK !</b><br>'+res.request, cls:'green'}).show();
            if(res.error)
                new Ext.Msg({html:'<b>Error !</b><br>'+res.request, cls:'red'}).show();
        },
        callback: cfg.callback || function(){},
        failure: function(response, opts) {
            new Ext.Msg({html:'<b>Error !</b><br>Status error: '+response.status, cls:'red'}).show();
        }
    })
}

function initUsers(){

    api.users = {
        add: function(){
            var f = Ext.getDom('uaddform');
            if(f['username'].value.trim() == ''){
                f['username'].value = '';
                Ext.fly(f['username']).highlight("#FFE8E8", {attr: "background-color"})
                return false;
            }
            if( f['password'].value.trim() == '' && f['confpass'].value.trim() == ''){
                f['password'].value = '';
                f['confpass'].value = '';
                Ext.fly(f['password']).highlight("#FFE8E8", {attr: "background-color"})
                Ext.fly(f['confpass']).highlight("#FFE8E8", {attr: "background-color"})
                return false;
            }
            if( !(f['password'].value.trim() == f['confpass'].value.trim()) ){
                Ext.fly(f['password']).highlight("#FFE8E8", {attr: "background-color"})
                Ext.fly(f['confpass']).highlight("#FFE8E8", {attr: "background-color"})
                return false;
            }
            api.get({
                method:'users.add&'+Ext.lib.Ajax.serializeForm('uaddform'),
                callback: function(){
                    Ext.getDom('uaddform').reset();
                }
            })
        },
        del: function(id){
            api.get({
                method:'users.del&userid='+id,
                callback: function(){
                    //location.reload();
                }
            })
        }
    }

    var userpanel = Ext.extend(Ext.Tabs, {
        id: 'doctab',
        contentEl: 'content',
        activeTab:0,
        resize: false,
        constructor: function(){
            userpanel.superclass.constructor.call(this);
        },
        els: [{
            id:'ulist',
            title: 'Список пользователей',
            htmlEl: 'ulistpage',
            closeable: false
        },{
            id:'uadd',
            title: 'Добавить пользователя',
            htmlEl: 'uaddpage',
            closeable: false
        }]
    })

    var id = "users";

    Ext.Ajax.request({
        url: '/api/?method='+id,
        success:function(response){
            app.tabs.content.update(response.responseText);
        },
        callback: function(){
            app.tabs = new userpanel();
            app.tabs.setPageActive();
        }
    })
}

Ext.onReady(function() {

    app.tabs = new Ext.Tabs({
        id: 'doctab',
        contentEl: 'content',
        resize: false
    });

    Ext.get('tree').select('a').each(function(){
        var el = Ext.get(this);
        el.on("click", function(ev,t){
            var id = t.href.split('#')[1];
            if(app.active == id){
                return false;
            }
            app.active = id;

            if(id == 'users'){
                initUsers();
            }
        })
    })

    var menu = Ext.get("menu").on("click", function(){
        var e = this.child('.sett');
        var m = this.child('.menu');
        if( !e.hasClass("setthover") ){
            e.toggleClass("setthover");
        }
        m.show();
        m.focus();
        m.on('blur', function(){
            if( e.hasClass("setthover") ){
                e.toggleClass("setthover");
            }
            m.hide();

        },null,{delay:150})
    })

    app.view = new Ext.Layout({
        listeners: {
            "resize": function(){
                var b = Ext.get("content");
                var e = Ext.get("center");
                var l = Ext.get("left");
                b.setStyle({
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
            "onRender": function(){
                //tree.body.setHeight( Ext.get('left').getHeight() - Ext.get('left').child('.top-left').getHeight() )

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
            }
        },
        items: [{
            pos: 'left',
            width: 230,
            el: 'left'
        },{
            pos: 'center',
            el: 'center'
        }]
    });

});
app.active = 'users';
initUsers();