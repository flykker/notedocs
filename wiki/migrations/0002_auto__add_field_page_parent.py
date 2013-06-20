# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Page.parent'
        db.add_column('wiki_page', 'parent',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['wiki.Page'], null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Page.parent'
        db.delete_column('wiki_page', 'parent_id')


    models = {
        'wiki.page': {
            'Meta': {'object_name': 'Page'},
            'content': ('django.db.models.fields.TextField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['wiki.Page']", 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['wiki']