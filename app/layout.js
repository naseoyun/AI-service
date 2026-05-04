import './globals.css'
import { Inter, Noto_Sans_KR } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const noto = Noto_Sans_KR({ subsets: ['latin'], weight: ['300', '400', '700', '900'], variable: '--font-noto' })

export const metadata = {
  title: 'job팜 - 구직자와 재직자를 위한 서비스',
  description: '자소서 분석, 기업 분석, 노동시장 예측 등 구직자와 재직자를 위한 프리미엄 통합 서비스',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${noto.variable}`}>
        {children}
      </body>
    </html>
  )
}
