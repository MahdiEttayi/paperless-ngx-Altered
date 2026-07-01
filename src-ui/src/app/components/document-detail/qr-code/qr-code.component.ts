import { Component, Input, inject, ElementRef, HostListener } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import * as QRCode from 'qrcode'
import { ShareLinkService } from 'src/app/services/rest/share-link.service'
import { FileVersion } from 'src/app/data/share-link'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'pngx-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  imports: [CommonModule, NgxBootstrapIconsModule],
})
export class QrCodeComponent {
  private shareLinkService = inject(ShareLinkService)
  private elementRef = inject(ElementRef)
  private baseUrl = environment.apiBaseUrl.replace(/\/api\/$/, '')

  @Input()
  documentId: number

  @Input()
  documentHasArchive: boolean = true

  qrDataUrl: string | null = null
  showQR = false

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showQR && !this.elementRef.nativeElement.contains(event.target)) {
      this.showQR = false
    }
  }

  toggleQR(): void {
    this.showQR = !this.showQR
    if (this.showQR && !this.qrDataUrl) {
      this.shareLinkService.getLinksForDocument(this.documentId).subscribe({
        next: (links: any) => {
          const existing = Array.isArray(links) && links.length > 0 ? links[0] : links?.results?.length > 0 ? links.results[0] : null
          if (existing) {
            this.generateQR(`${this.baseUrl}/share/${existing.slug}/`)
          } else {
            this.shareLinkService.createLinkForDocument(this.documentId, this.documentHasArchive ? FileVersion.Archive : FileVersion.Original, null).subscribe({
              next: (link) => {
                this.generateQR(`${this.baseUrl}/share/${link.slug}/`)
              },
            })
          }
        },
      })
    }
  }

  private generateQR(url: string): void {
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: '#005696', light: '#ffffff' },
    }).then((dataUrl: string) => {
      this.qrDataUrl = dataUrl
    })
  }

  downloadQR(): void {
    if (!this.qrDataUrl) return
    const link = document.createElement('a')
    link.href = this.qrDataUrl
    link.download = `document-${this.documentId}-qr.png`
    link.click()
  }

  printQR(): void {
    if (!this.qrDataUrl) return
    const win = window.open('', '_blank', 'width=400,height=400')
    if (!win) return
    win.document.write(`
      <html>
        <head><title>Print QR Code</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0">
          <img src="${this.qrDataUrl}" style="max-width:90vw;max-height:90vh" />
        </body>
      </html>
    `)
    win.document.close()
    win.onload = () => { win.print() }
  }
}
