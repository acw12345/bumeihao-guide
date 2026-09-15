import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '不美好的一天 · 综合攻略站',
  description: '完整查看天赋路线、天赋强度排行、机体排行、角色浅析与搭配攻略。',
  openGraph: {
    title: '不美好的一天 · 综合攻略站',
    description: '天赋路线、强度排行、机体与搭配攻略。',
    images: ['http://localhost:3000/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '不美好的一天 · 综合攻略站',
    description: '天赋路线、强度排行、机体与搭配攻略。',
    images: ['http://localhost:3000/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
