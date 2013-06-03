from django.db import models
from django.forms import ModelForm
from django.contrib import admin

class Page(models.Model):
    name = models.CharField(max_length=300);
    parent = models.ForeignKey('self', null=True, blank=True);
    content = models.TextField(null=True, blank=True);

    def get_lurl(self):
        #r = '<span style="margin: 0px 5px;font-size: 9px;">&gt;</span>';
        r = '<span style="margin: 0px 4px;font-size: 11px;">/</span>';
        node = [];
        root = self;
        if root.parent == None:
            el = '<a href="/view/%s">%s</a>' % (root.pk, root.name);
            node.append(el);
            node.reverse();
            return r + r.join(node);
        else:
            while(root.parent):
                el = '<a href="/view/%s">%s</a>' % (root.pk, root.name);
                node.append(el);
                root = root.parent;
            node.append('<a href="/view/%s">%s</a>' % (root.pk, root.name));
            node.reverse();
            return r + r.join(node);

    def __str__(self):
        return u'%s' % (self.name)

class PageAdmin(admin.ModelAdmin):
    pass
admin.site.register(Page, PageAdmin)

class PageForm(ModelForm):
    class Meta:
        model = Page