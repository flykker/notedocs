Ext.Tabs = Ext.extend(Ext.util.Observable, {
    id:null,
    el: null,
    active: null,
    content:null,
    activepage: null,
    opentab:[],
    tablist:null,

    constructor:function(config){
        Ext.apply(this, config);
        this.addEvents("click");
        Ext.Tabs.superclass.constructor.call(this, config);
        this.init();
    },

    init: function() {
        this.el = Ext.get(this.id);
        this.content = Ext.get(this.content);

        var tab = Ext.get(this.active);
        tab.on('click', this.tabClick, this, {e:tab,id:'dash'});

        this.active = Ext.get(this.active);
        this.activepage = Ext.get('pagedash');

        this.initMenu();
        this.initTabList();
    },

    initCook: function(){
        var me = this;
        var c = Ext.util.Cookies.get('opentabs') || '';
        var cook = eval('['+ c +']');

        if(cook.length > 0){
            Ext.each(cook, function(id){
                var e = Ext.get('view'+id);
                if(e !== null)
                    me.add(e, id);
            })
        }

        var at = Ext.util.Cookies.get('activetab') || '';
        if(at !== ''){
            var a = Ext.get(at);
            if(a !== null) a.dom.click();
        }
    },

    setActiveTab: function(tab, page){
        this.active.replaceClass('tab_cur','tabs');
        this.active = tab;
        tab.replaceClass('tabs','tab_cur');

        if(Ext.get('page'+page) === null){
            this.getPage(page);
        }else{
            this.setPageActive('page'+page);
        }

        this.widthTab(tab, true)
        Ext.util.Cookies.set('activetab', page );
    },

    setCook: function(){
        Ext.util.Cookies.set('opentabs', this.opentab.toString() );

    },

    initMenu: function(){
        var self = this;
        var el = Ext.get('context');

        var edit = Ext.get('pageedit');
        var add = Ext.get('pageadd');
        var del = Ext.get('pagedel');

        this.content.on('contextmenu', function(ev){
            ev.preventDefault();
            if(self.activepage.id == "pagedash"){ return false;}
            el.setTop(ev.getPageY()).setLeft(ev.getPageX() - self.content.getLeft());

            el.show().focus();
            var id = self.active.id.split('tab')[1];

            edit.on("click", function(){ el.hide(); window.location="/edit/" + id })
            add.on("click", function(){ el.hide(); window.location="/add/" + id })
            del.on("click", function(){ el.hide(); window.location="/del/" + id })

            return false;
        })

        el.on('blur', function(){ this.hide(); });
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
        tl.on("blur", function(){
            this.hide();
        })
    },
    onTabListClick: function(ev,target){
        this.tablist.hide();
        var t = Ext.get(target);
        if(t.hasClass('tlist')){
            var n = t.dom.id.split('ltab')[1];
            var tab = Ext.get('tab'+n);
            this.setActiveTab(tab, n);
        }
    },

    setPageActive: function(cont){
        var el = Ext.get(cont);
        this.activepage.toggleClass('active');
        this.activepage = el;
        el.toggleClass('active');
    },

    tabClick: function(ev,t,o){
        if(this.active != o.e){
            this.setActiveTab(o.e, o.id);
            Ext.util.Cookies.set('activetab', o.e.id );
            this.fireEvent('click', o.e);
        }
    },

    tabCloseClick: function(t, page){
        var self = this;
        t.child('.close').on('click', function(){
            if(t.hasClass('tab_cur')){
                var dash = Ext.get('dashtab').replaceClass('tabs','tab_cur');
                self.active = dash;
                self.fireEvent('click', dash);
                self.setPageActive('pagedash');
            }
            t.remove();
            self.opentab.remove(String(page));
            self.setCook();
        })
    },

    add: function(el, page){

        if(this.opentab.indexOf(page) != -1){
            var ot = Ext.get('tab'+page);
            this.widthTab(ot, true);
            ot.dom.click();
            return false;
        }

        var html = '<span style="margin-right:10px;">' + el.dom.innerHTML + '</span><div class="close"></div>';
        var tab = Ext.DomHelper.insertAfter(Ext.get("dashtab"), { id:'tab'+page, cls:"tabs", html: html  });

        tab = Ext.get(tab);
        tab.on('click', this.tabClick, this, {e:tab,id:page});
        this.tabCloseClick(tab, page);

        this.widthTab(tab, false);

        this.opentab.push(String(page));
        this.setCook();
        return tab;
    },

    getPage: function(page){
        var self = this;
        this.content.setStyle('background','url(/static/img/upload.gif) no-repeat 50% 50%')

        return Ext.Ajax.request({
            url: '/view/'+page,
            success: function(response, opts) {
                //console.log(response.responseText)
                Ext.DomHelper.append(self.content, { id:'page'+page, cls:'content', html: response.responseText  });
                self.content.setStyle('background','');

            },
            callback: function(){ self.setPageActive('page'+page); },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        })
    },

    tabResize: function(){
        var m = Ext.get("menu");
        var t = Ext.get("tabhide");
        var w = m.getWidth() + t.getWidth() + 40;
        var tabs = Ext.get("tab");
        var tw = tabs.getWidth();
        var maxw = tw - w;

        while( this.el.getWidth() > maxw ){
            var els = tabs.select('div.doctab > div{display!=none}').elements;
            var el = els[els.length - 1];
            Ext.get(el).setStyle("display","none");
        }
        this.updateTabList();
    },

    widthTab: function(tab, open){

        if(open && tab.isStyle("display","none")){
            tab.setStyle("display","block")
            tab.insertAfter('dashtab');
        }
        this.tabResize();
    },

    updateTabList: function(){
        Ext.get("tablist").select('.tlist').remove();
        var tlist = this.tablist;
        var tl = Ext.get("tab").select('div.doctab > div{display=none}').elements;
        Ext.each(tl, function(){
            var t = Ext.get(this).child('span');
            Ext.DomHelper.insertFirst(tlist, { id:'l'+this.id, cls:'tlist', html: t.dom.innerHTML  })
        })
    },

});