Ext.HtmlEditor = Ext.extend(Ext.util.Observable, {
    id: null,
    inText: "",
    editor:null,
    body: null,
    tbar: null,
    content: null,
    state: {},
    tbarButtons: ["goback","save","|","undo","redo","|","bold","italic","underline","|",
    "unorderedlist","orderedlist","outdent","indent","|",
    "left","center","right","|","forecolor","backcolor","removeformat","|","image","table","hr"],

    constructor: function(config){
        Ext.apply(this, config);
        this.addEvents("onsave");
        Ext.HtmlEditor.superclass.constructor.call(this, config);

        this.init();
        this.initBody();
        this.initTbar();
    },

    init: function(){
        this.inText = Ext.get(this.id).setStyle({"display":"none"});
    },

    initBody: function(){
        this.editor = this.inText.wrap({
            tag:"div", cls: "editor"
        });

        this.body = Ext.DomHelper.insertFirst(this.editor, {
            cls:"body", html: this.inText.getValue() || "<p><br></p>"
        });
        this.body = Ext.get(this.body);
        this.body.on("focus", function(){ if(this.ddActive !== null){ this.ddActive.hide(); } }, this)
        this.content = Ext.get(this.body.wrap({tag:"div", cls: "body-wrap"}));
        this.cMenu = Ext.get( Ext.DomHelper.append(this.content, {tag:'div', cls: 'editor-menu' }) );
        this.cMenu.on("blur", function(){ this.hide(); })
        this.cMenu.dom.setAttribute("tabindex", "-1");

        this.body.dom.setAttribute("contentEditable", "true");
        this.body.dom.setAttribute("tabindex", "-1");
        this.body.on("contextmenu", this.onContextMenu, this);
        this.body.on("keyup", function(){ this.state.save() }, this, { buffer:1000});
        this.undoManager();
        this.state.init();
    },

    onContextMenu: function(ev, t){
        ev.preventDefault();
        var targ = t;
        t= Ext.fly(t);
        this.cMenu.select('*').remove();
        if(t.findParent('table')){
            var table = Ext.fly(t.findParent('table'));
            Ext.DomHelper.append(this.cMenu,[
                { html:'Set row head', id:'head'},
                 { html:'Unset row head', id:'unhead',style:'border-bottom:1px solid #ddd;'},
                { html:'Insert column before', id:'icb' },
                { html:'Insert column after', id:'ica',style:'border-bottom:1px solid #ddd;'},
                { html:'Insert row before', id:'irb'},
                { html:'Insert row after', id:'ira' ,style:'border-bottom:1px solid #ddd;'},
                { html:'Delete table column', id:'dtc'},
                { html:'Delete table row', id:'dtr'},

            ])

            this.cMenu.setStyle({left:ev.getPageX()+'px', top:ev.getPageY()+'px'});
            this.cMenu.show();
            this.cMenu.focus();
            me = this.cMenu;
            Ext.get('icb').on("click", function(){
                var tr = table.select('tr');
                var ind = targ.cellIndex+1;
                tr.each(function(){
                    this.select('td:nth-child('+ind+')').insertHtml('beforeBegin', '<td>&nbsp;</td>');
                })
                me.hide();
                me.state.save();
            })

            Ext.get('ica').on("click", function(){
                var tr = table.select('tr');
                var ind = targ.cellIndex+1;
                tr.each(function(){
                    this.select('td:nth-child('+ind+')').insertHtml('afterEnd', '<td>&nbsp;</td>');
                })
                me.hide();
                me.state.save();
            })

            Ext.get('irb').on("click", function(){
                var tr = Ext.fly(targ).findParent('tr');
                var cnt = Ext.fly(tr).select('td').getCount();
                var td = "";

                for(var i=0; i<cnt; i++){
                    td += "<td>&nbsp;</td>";
                }
                Ext.fly(tr).insertHtml('beforeBegin', '<tr>'+td+'</tr>');
                me.hide();
                me.state.save();
            })

            Ext.get('ira').on("click", function(){
                var tr = Ext.fly(targ).findParent('tr');
                var cnt = Ext.fly(tr).select('td').getCount();
                var td = "";
                for(var i=0; i<cnt; i++){
                    td += "<td>&nbsp;</td>";
                }
                Ext.fly(tr).insertHtml('afterEnd', '<tr>'+td+'</tr>');
                me.hide();
                me.state.save();
            })

            Ext.get('dtc').on("click", function(){
                var el = Ext.fly(targ).findParent('table');
                var ind = targ.cellIndex+1;
                Ext.fly(el).select('tr').each(function(){
                    this.select('td:nth-child('+ind+')').remove();
                })
                me.hide();
                me.state.save();
            })
            Ext.get('dtr').on("click", function(){
                var el = Ext.fly(targ).findParent('tr');
                Ext.fly(el).remove();
                me.hide();
                me.state.save();
            })
            Ext.get('head').on("click", function(){
                var tr = table.select('tr').item(0);
                tr.addClass("head");
                me.hide();
                me.state.save();
            })
            Ext.get('unhead').on("click", function(){
                var tr = table.select('tr').item(0);
                tr.removeClass("head");
                me.hide();
                me.state.save();
            })
        }

    },

    initTbar: function(){
        this.tbar = Ext.DomHelper.insertFirst(this.editor, {
            cls:"toolbar"
        });

        this.tbar = Ext.get(this.tbar);

        this.initBtn();
    },

    initBtn: function(){
        var me =this;
        Ext.each(this.tbarButtons, function(){
            if(this == "|"){
                me.addSep();
            }else{
                me.addBtn(this);
            }

        })
    },

    addBtn: function(e){
        var b = Ext.DomHelper.append(this.tbar, {
            tag:"input", cls:"btn", type:"button"
        });
        e = this.buttons[e];
        b = Ext.get(b);
        b.addClass(e.cls);
        b.on("click", e.exe, this, {b:b});

        if(e.dd){
            var html = e.dd.html();
            b.dd = this.dd(e.dd.id, html);
            b.dd.on("click", e.dd.click, this);
        }
    },

    addSep: function(){
        Ext.DomHelper.append(this.tbar, {
            tag:"a", cls:"sep"
        });
    },

    undoManager: function(){
        var ed = this.body;
        this.state = {
            ed: ed,
            undo: function(){
                if(this.pos-1 >= 0){
                    this.ed.dom.innerHTML = this.stack[this.pos-1]
                    this.pos = this.pos -1;
                }
            },
            redo: function(){
                if(this.pos+1 <= this.stack.length-1){

                    this.ed.dom.innerHTML = this.stack[this.pos+1]
                    this.pos = this.pos+1;
                }
            },
            save: function(){
                this.stack = this.stack.slice(0,this.pos+1);
                this.stack.push(this.ed.dom.innerHTML);
                this.pos = this.stack.length-1;
            },
            init: function(){
                this.stack.push(this.ed.dom.innerHTML);
            },
            stack:[],
            pos:0
        };
    },

    buttons: {
        goback:{ cls:"goback", exe:function(){
            window.location = '/'
        }},
        save:{ cls:"save", exe:function(){
            this.inText.dom.innerHTML = this.body.dom.innerHTML;
            this.fireEvent("onsave");
        }},
        undo:{ cls:"undo", exe:function(){
            //this.exeCmd("undo", null);
            this.state.undo();
        }},
        redo:{ cls:"redo", exe:function(){
            //this.exeCmd("redo", null);
            this.state.redo();
        }},
        bold:{ cls:"b", exe:function(){
            this.exeCmd("bold", null);
        }},
        italic:{ cls:"i", exe:function(){
            this.exeCmd("italic", null);
        }},
        underline:{ cls:"underline", exe:function(){
            this.exeCmd("underline", null);
        }},
        unorderedlist:{ cls:"unorderedlist", exe:function(){
            this.exeCmd("InsertUnorderedList", null);
        }},
        orderedlist:{ cls:"orderedlist", exe:function(){
            this.exeCmd("InsertOrderedList", null);
        }},
        outdent:{ cls:"outdent", exe:function(){
            this.exeCmd("Outdent", null);
        }},
        indent:{ cls:"indent", exe:function(){
            this.exeCmd("Indent", null);
        }},
        left:{ cls:"left", exe:function(){
            this.exeCmd("JustifyLeft", null);
        }},
        center:{ cls:"center", exe:function(){
            this.exeCmd("JustifyCenter", null);
        }},
        right:{ cls:"right", exe:function(){
            this.exeCmd("JustifyRight", null);
        }},
        link:{ cls:"link", exe:function(){
            //this.exeCmd("link", null);
        }},
        unlink:{ cls:"unlink", exe:function(){
            //this.exeCmd("unlink", null);
        }},
        image:{
            cls:"image",
            exe:function(ev,t,o){
                var dd = o.b.dd;
                this.setActiveDD(dd.dom.id);
                dd.setLeft( o.b.getLeft() );
                dd.show();
                //dd.focus();
            },
            dd:{
                id: "image",
                html:function(){
                    return '<input class="in-image"/>&nbsp;<input type="button" value="Ok"/>'
                },
                click:function(ev,t){
                    if(t.type != "button"){
                        return false;
                    }
                    var val = Ext.get(t).prev().getValue();
                    this.exeCmd("inserthtml", '<img src="'+val+'" />');
                    Ext.get('image').hide();
                }
            }
        },
        table:{ cls:"table", exe:function(){
            if(Ext.isIE){
                var val = '<table><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></table>';
            }else{
                var val = '<table><tr><td><br></td><td><br></td><td><br></td></tr><tr><td><br></td><td><br></td><td><br></td></tr></table>';
            }
            this.exeCmd("inserthtml", val);
        }},
        forecolor:{
            cls:"forecolor",
            exe: function(ev,t,o){
                var dd = o.b.dd;
                this.setActiveDD(dd.dom.id);
                dd.setLeft( o.b.getLeft() );
                dd.show();
                //dd.focus();
            },
            dd:{
                id: "forecolor",
                colors: "FFF FCC FC9 FF9 FFC 9F9 9FF CFF CCF FCF " +
                        "CCC F66 F96 FF6 FF3 6F9 3FF 6FF 99F F9F " +
                        "BBB F00 F90 FC6 FF0 3F3 6CC 3CF 66C C6C " +
                        "999 C00 F60 FC3 FC0 3C0 0CC 36F 63F C3C " +
                        "666 900 C60 C93 990 090 399 33F 60C 939 " +
                        "333 600 930 963 660 060 366 009 339 636 " +
                        "000 300 630 633 330 030 033 006 309 303",
                html: function(){
                    var c = this.colors.split(" ");
                    var html = "";
                    Ext.each(c, function(){
                        html = html + '<input type="button" style="background:#'+ this +'" />';
                    })
                    return '<div class="fcolor">'+html+'</div>';
                },
                click: function(ev,t){
                    var val = Ext.get(t).getColor("background-color");
                    this.exeCmd("forecolor", val);
                    Ext.get('forecolor').hide();
                }
            }
        },
        backcolor:{
            cls:"backcolor",
            exe: function(ev,t,o){
                var dd = o.b.dd;
                this.setActiveDD(dd.dom.id);
                dd.setLeft( o.b.getLeft() );
                dd.show();
                //dd.focus();
            },
            dd:{
                id: "backcolor",
                colors: "FFF FCC FC9 FF9 FFC 9F9 9FF CFF CCF FCF " +
                        "CCC F66 F96 FF6 FF3 6F9 3FF 6FF 99F F9F " +
                        "BBB F00 F90 FC6 FF0 3F3 6CC 3CF 66C C6C " +
                        "999 C00 F60 FC3 FC0 3C0 0CC 36F 63F C3C " +
                        "666 900 C60 C93 990 090 399 33F 60C 939 " +
                        "333 600 930 963 660 060 366 009 339 636 " +
                        "000 300 630 633 330 030 033 006 309 303",
                html: function(){
                    var c = this.colors.split(" ");
                    var html = "";
                    Ext.each(c, function(){
                        html = html + '<input type="button" style="background:#'+ this +'" />';
                    })
                    return '<div class="fcolor">'+html+'</div>';
                },
                click: function(ev,t){
                    var val = Ext.get(t).getColor("background-color");
                    if(Ext.isIE){
                        this.exeCmd("backcolor", val);
                    }else{
                        this.exeCmd("hilitecolor", val);
                    }
                    Ext.get('backcolor').hide();
                }
            }
        },
        removeformat:{ cls:"removeformat", exe:function(){
            this.exeCmd("removeformat", null);
        }},
        hr:{ cls:"hr", exe:function(){
            this.exeCmd("inserthorizontalrule", null);
        }},
    },

    exeCmd: function(cmd, val){
        //this.body.focus();
        if (Ext.isIE && cmd.toLowerCase() == "inserthtml"){
            this.getRange(document).pasteHTML(val);
        }else{
            document.execCommand(cmd, false, val);
        }
        this.state.save();
    },

    ddlist:[],
    ddActive: null,
    setActiveDD: function(id){
        if(this.ddActive !== null){
            this.ddActive.hide();
            this.ddActive.blur();
        }
        this.ddActive = Ext.get(id);
    },

    dd: function(id,html){
        var dd = Ext.DomHelper.append(this.tbar, {
            id:id, cls:"ddlist", html:html
        });
        dd = Ext.get(dd);
        this.ddlist.push(dd.dom.id)
        dd.dom.setAttribute("tabindex","-1");
        dd.on("blur", function(ev){
            var target = ev.getTarget();
            var elt = Ext.get(target);
            if(elt.hasClass("ddlist")){
                return false;
            }else{
                this.hide();
            }
        })
        return dd;
    },

    getRange: function() {
        var sel = this.getSelection();
        if (Ext.isIE) return sel.createRange();
        return sel.getRangeAt(0);
    },

    getSelection: function() {
        if (Ext.isIE) return document.selection;
        return document.getSelection();
    }

})