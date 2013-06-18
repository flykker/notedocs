
Ext.Tree = Ext.extend(Ext.util.Observable, {
    id:null,
    el: null,
    body:false,
    active: false,
    scroll: false,
    scrollShow: false,
    h:false,
    scD: false,
    scrShow: false,

    constructor:function(config){
        Ext.apply(this, config);
        this.addEvents("select");
        Ext.Tabs.superclass.constructor.call(this, config);
        this.init();
        this.initEls();
    },

    init: function() {
        var me = this;
        this.el = Ext.get(this.id);
        this.el.select('.uli a').on('click', this.onClick, this);

        this.body = this.el.wrap({ tag:'div', cls:'tree-wrap', html:'<div id="scroll" class="scroll"></div>' });

        this.body.on("mousewheel", this.onWheel, this.el, {me:this});
        this.body.on("mouseover", this.onMouseOver, this.el, {me:this});
        this.body.on("mouseout", this.onMouseOut, this.el, {me:this});

        this.scroll = Ext.get("scroll");
        this.scroll.setOpacity(.1);
        this.dd = new Ext.DD({
            id:'scroll',
            maxT: 35,
            maxB: false,
            horiz:false,
            listeners:{
                "start":function(ev){
                    me.scD = this.el.getTop();
                    this.maxB = Ext.get("left").getHeight();

                    Ext.getBody().on("mouseup", function(){
                        if( me.scroll.isDrag ){
                            me.scroll.isDrag = false;
                        }
                    }, null, {single:true})
                },
                "drag": function(ev, pos){
                    var y = pos.y;
                    var d = me.scD - y;
                    me.scD = y;
                    me.treeScroll(d);
                }
            }
        })

    },

    onMouseOver: function(ev,t,o){
        if(o.me.scrShow){
            Ext.get("scroll").show();
        }
    },
    onMouseOut: function(ev,t,o){
        Ext.get("scroll").hide();
    },

    treeScroll: function(d){
        var delta = d;
        var speed = (this.el.getHeight()-this.body.getHeight() )/(this.body.getHeight()-this.scroll.getHeight()-6)
        d = Math.abs(d)*speed;
        var top = this.body.getTop();
        var bot = this.body.getBottom();

        if( delta > 0){
            if( this.el.getTop()+d >= top ){
                this.el.setTop(0);
                return false;
            }
            this.el.moveTo(0,this.el.getTop() + d);
        }else{
            if( this.el.getBottom()-d <= bot){
                var b = this.body.getHeight()-this.el.getHeight();
                this.el.setTop(b);
                return false;
            }
            this.el.moveTo(0,this.el.getTop() - d);
        }
    },

    onWheel: function(ev,t,o){
        var delta = ev.getWheelDelta();
        var d = (o.me.el.getHeight()-o.me.body.getHeight() )/10;
        var sd = (o.me.body.getHeight()-o.me.scroll.getHeight())/10;
        var top = o.me.body.getTop();
        var bot = o.me.body.getBottom();
        var sc = o.me.scroll;

        if( this.getHeight()>o.me.body.getHeight() ){
            if( delta > 0){
                if( this.getTop()+d >= top ){
                    this.setTop(0);
                    sc.setTop(35);
                    return false;
                }
                this.moveTo(0,this.getTop() + d);
                sc.setTop( sc.getTop() - sd );
            }else{

                if( this.getBottom()-d <= bot){
                    var b = o.me.body.getHeight()-this.getHeight();

                    this.setTop(b);
                    return false;
                }
                this.moveTo(0,this.getTop() - d);
                sc.setTop( sc.getTop() + sd );
            }
        }
    },

    onResize: function(){
        var difference = this.el.getHeight() - this.body.getHeight();

        if (difference > 0) {
            var proportion = difference / this.el.getHeight();
            var handleHeight = Math.round((1 - proportion) * this.body.getHeight());
            handleHeight -= handleHeight % 2;
        }

        if( this.el.getHeight() > this.body.getHeight() ){
            this.scrShow = true;

            this.scroll.setHeight( handleHeight);
            if( this.el.getTop() < 0){
                this.scroll.setTop(35+ Math.abs(this.el.getTop()) )
            }
            if( this.el.getBottom() < this.body.getBottom() ){
                var b = this.body.getHeight()-this.el.getHeight();
                this.el.setTop(b);
            }
        }else{
            this.scrShow = false;
            this.el.setTop(0);
        }
    },

    onClick: function(e,t){
        var e = Ext.get(t);
        this.setActive(e.id);
        this.fireEvent('select', e);
    },

    initEls: function(){
        var me = this;
        var trmenu = Ext.get('treemenu');
        var edit = Ext.get('edittree');
        var add = Ext.get('addtree');
        var del = Ext.get('deltree');

        Ext.select(".toggle_li").on("contextmenu", function(ev){
            ev.preventDefault();
            trmenu.setTop(ev.getPageY()).setLeft(ev.getPageX());
            trmenu.show().focus();
            var id = this.id.split('project')[1];
            edit.on("click", function(){ trmenu.hide(); window.location="/edit/" + id })
            add.on("click", function(){ trmenu.hide(); window.location="/add/" + id })
            del.on("click", function(){ trmenu.hide(); window.location="/del/" + id })

            return false;
        })
        trmenu.on('blur', function(){ this.hide(); });

        Ext.select(".toggle_li").on("click", function(){
            var e=Ext.get(this);
            var n=e.next();

            if(n !== null && n.hasClass("li-div")) {
                n.tgl();
                if( e.child('div.li_tog') !== null){ e.child('div.li_tog').toggleClass('toggle_li'); }
                me.onResize();
            }
        })

        Ext.select(".toggle_li").each(function(){
            var e=Ext.get(this);
            var n=e.next();
            if(n == null){ return false; }
            n.select('.triangle').on('click', function(){
                var t=Ext.get(this);
                var tn = t.next('ul');
                t.toggleClass('triangle-open');
                tn.tgl();
                me.onResize();
            })
        })

    },



    showActive: function(){
        if(this.active){
            var at = this.active;
            var fp = Ext.get( Ext.get(at).findParent('ul.tree') );
            var cur = fp.select('div.triangle:next(a#'+at.id+')').item(0)
            var els = fp.select('.triangle').elements;
            for(var i =0 ; i<els.length; i++){
                var t=Ext.fly(els[i]);
                //console.log(t.dom, cur.dom)
                if(cur !== null)
                    if( cur.dom == t.dom) break;
                if(!t.hasClass('triangle-open')){
                    var tn = t.next('ul');
                    t.toggleClass('triangle-open');
                    tn.tgl();
                }
            }
            var ep = Ext.get( fp.findParent('div.li-div') ).prev();

            if(!ep.child('div.li_tog').hasClass('toggle_li')){
                ep.dom.click();
            }
        }
    },

    setActive: function(id){
        if(this.active){
            this.active.setStyle({'font-weight':'normal'})
        }
        var tree = Ext.get(id);
        this.active = tree;
        if(tree !== null){
            tree.setStyle({'font-weight':'bold'});
        }
    },
});