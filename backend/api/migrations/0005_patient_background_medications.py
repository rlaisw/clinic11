# Generated migration for PatientBackground, ActiveMedication, PastMedication, Allergy

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0004_fix_queue_stats'),
    ]

    operations = [
        migrations.CreateModel(
            name='PatientBackground',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('chief_complaint', models.TextField(blank=True)),
                ('past_medical_history', models.JSONField(default=dict)),
                ('social_family_history', models.JSONField(default=dict)),
                ('occupation', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('patient', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='background', to='api.patient')),
            ],
        ),
        migrations.CreateModel(
            name='ActiveMedication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('dosage', models.CharField(max_length=100)),
                ('frequency', models.CharField(max_length=100)),
                ('start_date', models.DateField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='active_medications', to='api.patient')),
            ],
            options={
                'ordering': ['-start_date'],
            },
        ),
        migrations.CreateModel(
            name='PastMedication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('dosage', models.CharField(max_length=100)),
                ('frequency', models.CharField(max_length=100)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('reason_discontinuation', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='past_medications', to='api.patient')),
            ],
            options={
                'ordering': ['-end_date'],
            },
        ),
        migrations.CreateModel(
            name='Allergy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('substance', models.CharField(max_length=255)),
                ('reaction', models.TextField()),
                ('severity', models.CharField(choices=[('mild', 'Mild'), ('moderate', 'Moderate'), ('severe', 'Severe')], default='mild', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='patient_allergies', to='api.patient')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]