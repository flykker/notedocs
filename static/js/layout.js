Ext.Layout = Ext.extend(Ext.util.Observable, {

    el: null,
    els: {},
    doc: null,

    constructor:function(config){
        Ext.apply(this, config);

        this.addEvents("resize","onRender");

        Ext.Layout.superclass.constructor.call(this, config);

        this.init();
        this.fireEvent("onRender");
    },

    init: function() {
        this.doc = Ext.getBody().addClass('layout');

        Ext.fly(window).on('resize',function(){
            this.setBody();
        }, this)

        this.initEls();
        this.setBody();
        if(this.els.left.w > 0){
            this.leftResize();
        }

    },

    initEls: function(){
        Ext.each(this.items, function(el){
            this.els[el.pos] = this.add(el);
        }, this)
    },

    setBody: function() {
        var h = this.doc.h = Ext.lib.Dom.getViewHeight();
        var w = this.doc.w = Ext.lib.Dom.getViewWidth();

        this.doc.setHeight(h + 'px');
        this.doc.setWidth(w + 'px');

        this.setSizes();

    },

    setSizes: function() {
        var h1 = ((this.els.top) ? this.els.top.h : 0),
            h2 = ((this.els.bottom) ? this.els.bottom.h : 0),
            h = this.doc.h, w = this.doc.w;

        var top = {
            h: h1, w: ((this.els.top) ? w : 0),
            t: 0
        };

        var bottom = {
            h: h2, w: ((this.els.bottom) ? w : 0)
        };

        var newH = (h - (h1 + h2));

        var left = {
            h: newH, w: ((this.els.left) ? this.els.left.w : 0)
        };

        if (this.els.left) {
            this.els.left.l = 0;
            if (this.els.top) {
                this.els.left.t = top.h;
            } else {
                this.els.left.t = 0;
            }
            this.els.left.h = left.h;
            this.els.left.w = left.w;

            this.els.left.setStyle({'position':'absolute','left':'0px', 'top':this.els.left.t+'px', 'width': left.w+'px', 'height': left.h+'px'});
        }

        if (this.els.bottom) {
            this.els.bottom.t = top.h + left.h;
            this.els.bottom.w = bottom.w;
        }

        if (this.els.top) {
            this.els.top.w = top.w;
            this.els.top.h = top.h;

            this.els.top.setStyle({'position':'absolute', 'width': top.w+'px', 'height': top.h+'px'});
        }
        this.setCenter();
    },

    setCenter: function() {
        this.els.center.h = this.els.left.h;
        this.els.center.w = (this.doc.w - this.els.left.w);
        this.els.center.t = ((this.els.top) ? this.els.top.h:0);
        this.els.center.l = this.els.left.w + this.els.left.getBorderWidth('lr');

        this.els.center.setStyle({
            'position':'absolute',
            'left':this.els.center.l+'px',
            'top':this.els.center.t+'px',
            'width': this.els.center.w+'px',
            'height': this.els.center.h+'px'
        });

        this.fireEvent("resize");
    },

    add: function(el) {
        var element=null;

        if (!el.pos) {
            return false;
        }
        if (this.els[el.pos]) {
            return false;
        }

        if (el.el) {
            if (Ext.get(el.el)) {
                element = Ext.get(el.el);
            }
        }else{
            element = document.createElement('div');
            element = Ext.get(element);
            this.doc.appendChild(element);
        }

        if(el.cls){
            element.addClass(el.cls);
        }

        Ext.applyIf(element, el);
        element.h = ((el.height) ? el.height:0);
        element.w = ((el.width) ? el.width:0);
        delete element.height; delete element.width;

        return element;
    },

    leftResize: function(){
        var me = this;
        var lr = Ext.get("lresize");
        var dd = new Ext.DD({
            id:"lresize",
            vert:false,
            maxR:400,
            maxL:210,
            listeners:{
                "start":function(ev){
                    Ext.getBody().on("mouseup", function(){
                        if( dd.el.isDrag ){
                            dd.el.isDrag = false;
                        }
                    }, null, {single:true})
                },
                "drag": function(ev, pos){
                    var x = pos.x+2;
                    Ext.get("left").setWidth(x);
                    Ext.get("center").setLeft(x);
                    Ext.get("center").setWidth(Ext.lib.Dom.getViewWidth() - x);
                    me.els.center.l = Ext.get("left").getWidth();
                    if(me.els.left){
                        me.els.left.w = Ext.get("left").getWidth();
                    }

                }
            }
        })
    }

});
