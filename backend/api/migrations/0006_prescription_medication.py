from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0005_patient_background_medications'),
    ]

    operations = [
        migrations.CreateModel(
            name='PrescriptionMedication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item', models.PositiveIntegerField()),
                ('medication_name', models.CharField(max_length=255)),
                ('dosage_amount', models.DecimalField(max_digits=10, decimal_places=2)),
                ('dosage_unit', models.CharField(max_length=20)),
                ('route', models.CharField(choices=[('oral', 'Oral'), ('IV', 'IV'), ('IM', 'IM'), ('SC', 'SC'), ('topical', 'Topical'), ('inhalation', 'Inhalation')], max_length=20)),
                ('frequency', models.CharField(max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('patient', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='prescription_medications', to='api.patient')),
            ],
            options={
                'ordering': ['item'],
            },
        ),
    ]