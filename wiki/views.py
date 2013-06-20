import os
from django.shortcuts import render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from models import Page, Attach
from django.contrib.auth.decorators import login_required
from django.template import RequestContext
from django.contrib.auth.models import User

@login_required(login_url='/login')
def home(request):
    p = Page.objects.filter(parent=None);
    node = tree(None, True);
    return render_to_response('web2/index.html', {'tree':node, 'page':p}, context_instance=RequestContext(request));

@login_required(login_url='/login')
def manage(request):
    return render_to_response('web2/manage.html', context_instance=RequestContext(request));

@login_required(login_url='/login')
def view(request, page_id):
    page = Page.objects.get(id=page_id);
    a = Attach.objects.filter(page=page);
    return render_to_response('web2/view.html', {'page':page, 'attach':a }, context_instance=RequestContext(request));

@login_required(login_url='/login')
def edit(request, page_id):
    page = Page.objects.get(id=page_id)
    return render_to_response('web2/edit.html', {'page':page}, context_instance=RequestContext(request));

@login_required(login_url='/login')
def new(request):
    if request.method == 'POST':
        p = Page.objects.create(name=request.POST['name'], content=request.POST['content']);
        return HttpResponseRedirect('/');
    return render_to_response('web2/new.html', context_instance=RequestContext(request));

@login_required(login_url='/login')
def add(request, page_id):
    if request.method == 'POST':
        page = Page.objects.get(id=page_id);
        p = Page.objects.create(parent=page,name=request.POST['name'], content=request.POST['content']);
        return HttpResponseRedirect('/');
    return render_to_response('web2/add.html', context_instance=RequestContext(request));

@login_required(login_url='/login')
def save(request):
    if request.method == 'POST':
        page_id = request.POST['page_id'];
        page = Page.objects.get(id=page_id);
        page.name = request.POST['name'];
        page.content = request.POST['content'];
        page.save();
    return HttpResponseRedirect('/');

@login_required(login_url='/login')
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
                node += '<div id="project'+ str(e.pk) +'" class="li toggle_li"><div class="hide-li"></div><div class="li_tog"></div>'+e.name+'</div>';
                node += '<div class="li-div">'
                node += tree(e.pk, True, cur);
                node+= '</div>';
            else:
                node += '<div id="project'+ str(e.pk) +'" class="li toggle_li"><div class="hide-li"></div>'+e.name+'</div>';

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
            node += '<li class="uli" style="font-size:12px;line-height: 20px;list-style-type: none;"><div class="'+cls+'"></div><a id="tree'+str(e.pk)+'" '+curr+'>' + e.name + '</a>';

            if par:
                node += tree(e.pk, False, cur);
            node += '</li>';
            node += '</ul>';
    return node;

def uploaded_file(f):
    with open('/home/flykker/simpledoc/media/'+f.name, 'wb+') as file:
        for chunk in f.chunks():
            file.write(chunk)

@login_required(login_url='/login')
def api(request):
    if request.method == "GET":
        if request.GET.get('method'):
            method = request.GET.get('method');
            if method == "users":
                users = User.objects.all();
                return render_to_response('web2/api/users.html',{'users':users}, context_instance=RequestContext(request));
            if method == "users.add":
                u = request.GET.get('username');
                m = request.GET.get('mail');
                p = request.GET.get('password');
                User.objects.create_user(u, m, p);
                return HttpResponse('{"request":"User add."}')
            if method == "users.del":
                id = request.GET.get('userid');
                user = User.objects.get(pk=id);
                user.delete();
                return HttpResponse('{"request":"User delete."}')
            if method == "attach.del":
                id = request.GET.get('id');
                a = Attach.objects.get(id=id);
                os.remove("/home/flykker/simpledoc/media/"+a.name);
                a.delete();
                return HttpResponse('{"request":"OK."}')
    if request.method == "POST":
        if request.POST.get('method'):
            method = request.POST.get('method');
            if method == "attach":
                p = request.POST.get('page');
                f = request.FILES['file'];
                uploaded_file(f);
                Attach.objects.create(name=f.name,page=Page.objects.get(id=p),size=f.size, comment="");
                return HttpResponse('{"request":"OK."}')
    return HttpResponse('{"error":"Error."}')


