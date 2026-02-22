import Image from 'next/image'
import React from 'react'

import './styles.css'

export default async function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-slate-100">
      <div className="prose">
        <h1>Capoeira Angola Aotearoa</h1>
        <div className="flex justify-center">
          <Image
            priority
            src={'logo.svg'}
            width={300}
            height={300}
            alt="Capoeira Angola Aotearoa logo"
          />
        </div>
      </div>
    </main>
  )
}
