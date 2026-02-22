import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withPayload(nextConfig, { devBundleServerPackages: false })

import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev())
