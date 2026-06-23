import { Component, Input, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgxBootstrapIconsModule } from 'ngx-bootstrap-icons'
import { Router } from '@angular/router'
import * as QRCode from 'qrcode'

@Component({
  selector: 'pngx-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.scss'],
  imports: [CommonModule, NgxBootstrapIconsModule],
})
export class QrCodeComponent {
  private router = inject(Router)

  @Input()
  documentId: number

  qrDataUrl: string | null = null
  showQR = false

  toggleQR(): void {
    this.showQR = !this.showQR
    if (this.showQR && !this.qrDataUrl) {
      const url = this.router.url
        .replace(/\/details$/, '')
        .replace(/\/[^/]+$/, '')
      const baseUrl = window.location.origin + url
      QRCode.toDataURL(baseUrl, {
        width: 200,
        margin: 2,
        color: { dark: '#005696', light: '#ffffff' },
      }).then((url: string) => {
        this.qrDataUrl = url
      })
    }
  }
}
