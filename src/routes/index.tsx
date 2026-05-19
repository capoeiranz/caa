import { createFileRoute } from "@tanstack/react-router"
import { Image } from "@unpic/react"

import logo from "#/assets/logo.webp"
import { Prose } from "#/components/prose"

export const Route = createFileRoute("/")({ component: Home })

function Home() {
  return (
    <div className="flex w-full justify-center">
      <Prose
        className="
          flex-col justify-items-center px-2 pt-1
          lg:pt-10
        "
      >
        <h1>Capoeira Angola Aotearoa</h1>

        <Image src={logo} width={300} height={300} alt="Capoeira Angola Aotearoa logo" priority />
      </Prose>
    </div>
  )
}
