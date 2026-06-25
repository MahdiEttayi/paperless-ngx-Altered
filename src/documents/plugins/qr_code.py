import io
import logging
from pathlib import Path

import fitz
import qrcode
from django.conf import settings
from django.utils.crypto import get_random_string
from django.utils import timezone

from documents.models import Document, ShareLink

logger = logging.getLogger("paperless.qr_code")


def _get_or_create_share_link(document: Document) -> str:
    now = timezone.now()
    existing = ShareLink.objects.filter(
        document=document,
        expiration__isnull=True,
    ).first()
    if existing is not None:
        return existing.slug

    slug = get_random_string(50)
    ShareLink.objects.create(
        document=document,
        slug=slug,
        file_version=ShareLink.FileVersion.ARCHIVE,
        expiration=None,
    )
    return slug


def stamp_qr_on_pdf(document: Document) -> None:
    if not settings.PAPERLESS_QR_ENABLED:
        return

    archive_path = str(document.archive_path)
    if not archive_path or not Path(archive_path).is_file():
        logger.warning(f"No archive file for document {document.pk}: {archive_path}")
        return

    base_url = settings.PAPERLESS_QR_BASE_URL.strip("/")
    position = settings.PAPERLESS_QR_POSITION
    slug = _get_or_create_share_link(document)
    qr_data = f"{base_url}/share/{slug}/"

    _stamp_qr_on_pdf_file(archive_path, qr_data, position)
    logger.info(f"QR code stamped on document {document.pk} at {archive_path}")


def _stamp_qr_on_pdf_file(pdf_path: str, qr_data: str, position: str) -> None:
    qr_img = qrcode.make(qr_data, box_size=10, border=2)
    qr_bytes = io.BytesIO()
    qr_img.save(qr_bytes, format="PNG")
    qr_bytes.seek(0)

    pdf = fitz.open(pdf_path)
    page = pdf[0]
    page_rect = page.rect

    qr_size = 50
    margin = 10
    if position == "top-left":
        x, y = margin, margin
    elif position == "top-right":
        x = page_rect.width - qr_size - margin
        y = margin
    elif position == "bottom-left":
        x = margin
        y = page_rect.height - qr_size - margin
    else:
        x = page_rect.width - qr_size - margin
        y = page_rect.height - qr_size - margin

    rect = fitz.Rect(x, y, x + qr_size, y + qr_size)
    page.insert_image(rect, stream=qr_bytes.read())

    pdf.save(pdf_path, incremental=True, encryption=0)
    pdf.close()
