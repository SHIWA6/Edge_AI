import { Inter } from 'next/font/google'
import './globals.css'
import { children } from 'react';

const inter  = Inter({ subsets : ['latin']});
export  const metadata = {
    title : " Edge_AI",
    description: " Talk cricket"
}

export default function RootLayout ({children}){
    return (
        <html lang='en'>
        <body className={inter.className}> 
            {children} </body>
        </html>
    )
}