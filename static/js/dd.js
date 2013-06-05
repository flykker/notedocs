Ext.DD = Ext.extend(Ext.util.Observable, {
    id: false,
    el: false,
    maxT: false,
    maxB: false,
    maxL: false,
    maxR: false,
    horiz:true,
    vert:true,
    bCoord: {x:0,y:0},

    constructor: function(cfg){
        Ext.apply(this, cfg);
        this.addEvents("drag","start","end");
        Ext.DD.superclass.constructor.call(this);

        this.init();
    },

    init: function(){
        this.el = Ext.get(this.id);
        this.el.on("mousedown", this.onMouseDown, this);
        this.el.on("mouseup", this.onMouseUp, this);
        Ext.fly(document).on("mousemove", this.onMove, this);
    },

    onMouseDown: function(ev){
        document.ondragstart = function() { return false }
        document.body.onselectstart = function() { return false }
        this.el.setStyle({position:'absolute'});

        this.bCoord.x = ev.getPageX() - this.el.getLeft();
        this.bCoord.y = ev.getPageY() - this.el.getTop();

        this.el.setStyle({
            "left": ev.getPageX() - this.bCoord.x+"px",
            "top": ev.getPageY() - this.bCoord.y+"px"
        })

        this.bCoord.x = ev.getPageX() - this.el.getLeft();
        this.bCoord.y = ev.getPageY() - this.el.getTop();

        this.el.isDrag = true;
        this.fireEvent("start", ev);
    },

    onMouseUp: function(ev){
        this.el.isDrag = false;
        document.ondragstart = null
        document.body.onselectstart = null
        this.fireEvent("end", ev);
    },
    pos: {x:null,y:null},
    onMove:function(ev,t){

        if(this.el.isDrag){

            if(this.vert){
                var y = ev.getPageY()-this.bCoord.y;
                var ybot = y + this.el.getHeight();
                if(this.pos.y == null){
                    this.pos.y = y;
                }
                if(this.maxT){
                    if( y >= this.maxT && ybot <= this.maxB){
                        this.el.setTop(y);
                        this.pos.y=y;
                    }
                }else{
                    this.el.setTop(y);
                    this.pos.y=y;
                }
            }

            if(this.horiz){
                var x = ev.getPageX()-this.bCoord.x;
                var xr = x + this.el.getWidth();
                if(this.pos.x == null){
                    this.pos.x = x;
                }
                if(this.maxL || this.maxR){
                    if( x >= this.maxL && xr <= this.maxR ){
                        this.el.setLeft(x);
                        this.pos.x = x;
                    }
                }else{
                    this.el.setLeft(x);
                    this.pos.x=x;
                }
            }

            this.fireEvent("drag", ev, {x:this.pos.x,y:this.pos.y});

        }
    }
})