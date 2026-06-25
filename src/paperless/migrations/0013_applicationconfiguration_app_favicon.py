from django.core.validators import FileExtensionValidator
from django.db import migrations
from django.db import models


class Migration(migrations.Migration):
    dependencies = [
        ("paperless", "0012_applicationconfiguration_llm_output_language"),
    ]

    operations = [
        migrations.AddField(
            model_name="applicationconfiguration",
            name="app_favicon",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to="favicon/",
                validators=[
                    FileExtensionValidator(
                        allowed_extensions=["ico", "jpg", "png", "gif", "svg"],
                    ),
                ],
                verbose_name="Application favicon",
            ),
        ),
    ]
