Ext.ns('app.tabs.els')
var G = Ext.get, DH = Ext.DomHelper, F=Ext.fly;
Ext.Tabs = Ext.extend(Ext.util.Observable, {
    id:null,
    el: null,
    activeTab: null,
    content:null,
    contentEl: null,
    activeContent: null,
    els:[],
    tablist:null,
    resize:true,

    constructor:function(config){
        Ext.apply(this, config || {});
        this.addEvents("click","remove");
        Ext.Tabs.superclass.constructor.call(this);
        this.init();
    },

    init: function() {
        this.el = G(this.id);
        this.content = this.contentEl ? G(this.contentEl):DH.insertAfter(this.el, {tag:'div'});

        this.initEls();
        this.initTabList();
        if(this.activeTab !== null){
            this.setActiveTab(this.activeTab);
        }

        this.initPlugins();
    },

    initEls: function(){
        var a = this.els;
        this.els = [];
        for(var i=0; i<a.length;i++){
            var el = a[i];
            this.add(el);
        }
    },

    setActiveTab: function(tab){
        var t = this.getTab(tab);
        if(this.activeTab !== null){
            this.activeTab = this.getTab(this.activeTab);
            if(this.activeTab != t){
                if(this.activeTab.tab.dom){
                    this.activeTab.tab.replaceClass('tab-active','tab');
                }
            }
        }

        this.activeTab = t;
        t.tab.replaceClass('tab','tab-active');
        this.scrollTab(t, true);
        if(t.html)
            this.setPageActive();
        this.fireEvent('click',t);
    },

    add: function(el){

        var close, html, tab,
            E = this.els.indexOf(el),
            i = this.els.length;

        if( E >= 0){
            this.setActiveTab(el);
            return false;
        }

        el.closeable = (el.closeable || el.closeable === undefined)? true:false;
        html = el.closeable ? '<span style="margin-right:10px;">'+ el.title +'</span><div class="close"></div>':'<span>'+ el.title +'</span></div>';
        var elid = el.id ? el.id:'tab'+i;
        tab = DH.append(this.el, { id:elid, cls:"tab", html: html  });
        tab = el.tab = G(tab);

        if(el.htmlEl){
            el.html = G(el.htmlEl);
        }else if(el.load){
            this.htmlLoad(el.load);
        }

        this.els.push(el);
        tab.ref = el;
        this.scrollTab(tab, false);

        tab.on('click', this.tabClick, this, {e:el,id:i});
        tab.select('div.close').on('click', this.tabCloseClick, this);

        return el;
    },

    getTab: function(i){
        return Ext.isObject(i) ? i:this.els[i];
    },

    initTabList: function(){
        var tl = this.tablist = Ext.get("tablist");
        this.tablist.on("click", this.onTabListClick, this);

        tl.set({tabindex:"-1"});
        var tb = Ext.get("tabhide");
        tb.on("click", function(){
            tl.setTop( tb.getBottom() +2 );
            tl.setRight( Ext.lib.Dom.getDocumentWidth() - tb.getRight() );

            tl.show();
            tl.focus();
        })
        tl.on("blur", function(){ this.hide(); })
    },

    onTabListClick: function(ev,target){
        this.tablist.hide();
        var t = Ext.get(target);
        if(t.hasClass('tlist')){
            var n = t.dom.id.split('ltab-')[1];
            var tab = G('tab-'+n);
            this.setActiveTab(tab.ref);
        }
    },

    setPageActive: function(){
        if(this.activeContent !== null)
            if(this.activeContent.dom)
                this.activeContent.toggleClass('active');

        this.activeContent = this.activeTab.html;
        this.activeTab.html.toggleClass('active');
    },

    tabClick: function(ev,t,o){
        if(this.activeTab != o.e){
            this.setActiveTab(o.e);
        }
    },

    tabCloseClick: function(ev,t){
        var self = this;
        var tab = F(t).parent();
        if(tab.hasClass('tab-active')){
            var ft = self.getTab(0);
            ft.tab.replaceClass('tab','tab-active');
            self.activeTab = ft;
            self.fireEvent('click', ft);
        }
        if(self.activeContent)
            self.setPageActive();
        if(tab.ref.html)
            tab.ref.html.remove();
        tab.remove();
        self.els.remove(tab.ref);
        self.fireEvent("remove");
    },

    tabResize: function(){
        var w = Ext.lib.Dom.getViewWidth() - this.el.getLeft() - 50;
        while( this.el.getWidth() > w ){
            console.log("resize");
            var els = this.el.select('> div{display!=none}').elements;
            var el = els[els.length - 1];
            G(el).setStyle("display","none");
        }
        this.updateTabList();
    },

    scrollTab: function(el, open){
        if(this.resize){
            if(open && el.tab.isStyle("display","none")){
                el.tab.setStyle("display","block");
                var ft = this.getTab(0);
                el.tab.insertAfter(ft.tab);
                var arr =[];
                this.el.select('> div').each(function(){
                    arr.push(G(this.id).ref);
                })
                this.els = arr;
            }
            this.tabResize();
        }
    },

    updateTabList: function(){
        Ext.get("tablist").select('.tlist').remove();
        var tlist = this.tablist;
        var tl = this.el.select('> div{display=none}').elements;
        Ext.each(tl, function(){
            var t = G(this).child('span');
            DH.insertFirst(tlist, { id:'l'+this.id, cls:'tlist', html: t.dom.innerHTML  })
        })
    },
    htmlLoad: function(cfg){
        var me = this;
        this.content.setStyle('background','url(/static/img/upload.gif) no-repeat 50% 50%');
        Ext.Ajax.request({
            url: cfg.url,
            method: 'get',
            success: function(res) {
                DH.append(me.content, { id:cfg.id, cls:'content', html: res.responseText });
                me.content.setStyle('background','');
            },
            callback: cfg.callback || function(){}
        })
    },
    plugins:[],
    initPlugins: function(){
        if(this.plugins.length){
            for(var i=0; i < this.plugins.length; i++){
                var fn=this.plugins[i];
                fn.call(this);
            }
        }
    }
});
