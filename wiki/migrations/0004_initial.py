# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Page'
        db.create_table('wiki_page', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=300)),
            ('parent', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['wiki.Page'], null=True, blank=True)),
            ('content', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal('wiki', ['Page'])

        # Adding model 'Attach'
        db.create_table('wiki_attach', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=300)),
            ('page', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['wiki.Page'])),
            ('size', self.gf('django.db.models.fields.CharField')(max_length=300)),
            ('comment', self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True)),
        ))
        db.send_create_signal('wiki', ['Attach'])


    def backwards(self, orm):
        # Deleting model 'Page'
        db.delete_table('wiki_page')

        # Deleting model 'Attach'
        db.delete_table('wiki_attach')


    models = {
        'wiki.attach': {
            'Meta': {'object_name': 'Attach'},
            'comment': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'page': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['wiki.Page']"}),
            'size': ('django.db.models.fields.CharField', [], {'max_length': '300'})
        },
        'wiki.page': {
            'Meta': {'object_name': 'Page'},
            'content': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'parent': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['wiki.Page']", 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['wiki']