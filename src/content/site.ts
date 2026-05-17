export async function getAllPages() {
  return [
    {
      slug: "/",
      updatedAt: Date.now(),
    },
  ] as const
}

export async function getSite() {
  return {
    baseUrl: "https://capoeira.org.nz",
    title: "Capoeira Angola Aotearoa",
    description: "Capoeira Angola Classes with Mestre Brabo in Aotearoa, New Zealand",
  }
}
