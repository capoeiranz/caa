import { createFileRoute } from "@tanstack/react-router"
import { Image } from "@unpic/react"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-slate-100 p-24">
      <div className="prose">
        <h1>Capoeira Angola Aotearoa</h1>
        <div className="flex justify-center">
          <Image
            priority
            src={"logo.svg"}
            width={300}
            height={300}
            alt="Capoeira Angola Aotearoa logo"
          />
        </div>
      </div>
    </main>
  )
}
