# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2017-07-03 03:41
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('timeline', '0004_auto_20170629_1705'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='accounts.UserProxy'),
        ),
    ]
