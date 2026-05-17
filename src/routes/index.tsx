import { createFileRoute } from "@tanstack/react-router"
import { Image } from "@unpic/react"

import logo from "#/assets/logo.svg"
import { Prose } from "#/components/prose"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <div className="flex w-full justify-center">
      <Prose className="flex-column justify-items-center p-2 lg:pt-24">
        <h1>Capoeira Angola Aotearoa</h1>

        <Image
          src={logo}
          width={300}
          height={300}
          alt="Capoeira Angola Aotearoa logo"
          loading="eager"
          fetchPriority="high"
        />
      </Prose>
    </div>
  )
}
