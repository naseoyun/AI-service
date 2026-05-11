import './globals.css'
import Navbar from './components/Navbar'

export const metadata = {
  title: 'job팜 - AI 기반 커리어 플랫폼',
  description: '자소서 분석부터 기업 분석까지, AI로 완성하는 나만의 커리어',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
