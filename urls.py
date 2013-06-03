from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'wiki.views.home', name='home'),
    url(r'^view/(?P<page_id>\d+)/$', 'wiki.views.view',name='view'),
    url(r'^new$', 'wiki.views.new', name='new'),
    url(r'^add/(?P<page_id>\d+)/$', 'wiki.views.add', name='add'),
    url(r'^edit/(?P<page_id>\d+)/$', 'wiki.views.edit', name='edit'),
    url(r'^save$', 'wiki.views.save', name='save'),

    url(r'^del/(?P<page_id>\d+)/$', 'wiki.views.delete', name='delete'),
    # url(r'^simpledoc/', include('simpledoc.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    #url(r'^admin/', include(admin.site.urls)),
)
