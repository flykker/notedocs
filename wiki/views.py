from django.shortcuts import render_to_response, redirect
from django.http import HttpResponseRedirect
from models import Page, PageForm

def home(request):
    p = Page.objects.filter(parent=None);
    node = tree(None, True);
    return render_to_response('web2/index.html', {'tree':node, 'page':p});

def view(request, page_id):
    page = Page.objects.get(id=page_id)
    node = tree(None, False, page);
    lurl = page.get_lurl();
    return render_to_response('web2/view.html', {'page':page, 'tree':node, 'lurl':lurl });

def edit(request, page_id):
    page = Page.objects.get(id=page_id)
    return render_to_response('web2/edit.html', {'page':page});

def new(request):
    if request.method == 'POST':
        p = Page.objects.create(name=request.POST['name'], content=request.POST['content']);
        return HttpResponseRedirect('/');
    return render_to_response('web2/new.html');

def add(request, page_id):
    if request.method == 'POST':
        page = Page.objects.get(id=page_id);
        p = Page.objects.create(parent=page,name=request.POST['name'], content=request.POST['content']);
        return HttpResponseRedirect('/');
    return render_to_response('web2/add.html');

def save(request):
    if request.method == 'POST':
        page_id = request.POST['page_id'];
        page = Page.objects.get(id=page_id);
        page.name = request.POST['name'];
        page.content = request.POST['content'];
        page.save();
    return HttpResponseRedirect('/');

def delete(request, page_id):
    page = Page.objects.get(id=page_id);
    page.delete();
    return HttpResponseRedirect('/');

def tree(parent, id, cur=None):
    page = Page.objects.filter(parent=parent);
    node ="";
    for e in page:
        if e.parent == None:
            par = Page.objects.filter(parent=e.pk);
            if par:
                node += '<div id="pr'+ str(e.pk) +'" class="li toggle_li"><div class="li_tog"></div>'+e.name+'</div>';
                node += '<div class="li-div">'
                node += tree(e.pk, True, cur);
                node+= '</div>';
            else:
                node += '<div id="pr'+ str(e.pk) +'" class="li toggle_li">'+e.name+'</div>';

        else:
            tr = "";
            if id:
                tr = " tree";
            node += '<ul class="ul'+tr+'">';
            curr = '';
            if e == cur:
                curr = ' class="current"';
            par = Page.objects.filter(parent=e.pk);
            cls="cube";
            if par:
                cls="triangle";
            node += '<li class="uli" style="font-size:12px;line-height: 20px;list-style-type: none;"><div class="'+cls+'"></div><a id="view'+str(e.pk)+'" '+curr+'>' + e.name + '</a>';

            if par:
                node += tree(e.pk, False, cur);
            node += '</li>';
            node += '</ul>';
    return node;
