# Generated by Django 4.1.3 on 2022-12-16 19:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wallets', '0014_walletlog'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='StartPage',
            fields=[
                ('name', models.CharField(max_length=32, primary_key=True, serialize=False)),
            ],
        ),
        migrations.DeleteModel(
            name='ChartSettings',
        ),
        migrations.RemoveField(
            model_name='accountsettings',
            name='week_start',
        ),
        migrations.AddField(
            model_name='accountsettings',
            name='currency_format',
            field=models.CharField(choices=[('left', 'Left'), ('right', 'Right')], default='left', max_length=32),
        ),
        migrations.AlterField(
            model_name='accountsettings',
            name='main_currency',
            field=models.ForeignKey(default='USD', on_delete=django.db.models.deletion.SET_DEFAULT, to='wallets.currency'),
        ),
        migrations.AlterField(
            model_name='accountsettings',
            name='start_page',
            field=models.ForeignKey(default='Dashboard', on_delete=django.db.models.deletion.SET_DEFAULT, to='accounts.startpage'),
        ),
    ]