import { bench } from "vitest"

import { safeParseFast } from "./media.fast.ts"
import { safeParsePath } from "./media.ts"

const examplePaths = [
  "/123",
  "/a/b/c/d/e",
  "/12fcasdfaefaef",
  "/satisfies",
  "/sss/sss/ddddas.png",
  "/var/log/nginx/access.log",
  "/usr/local/bin/docker-compose",
  "/home/user/documents/finance/2026_budget.xlsx",
  "/etc/ssl/certs/ca-certificates.crt",
  "/app/src/components/button/index.tsx",
  "/var/www/html/assets/img/logo.png",
  "/opt/database/data/backup_main.sql",
  "/Users/admin/Downloads/archive_v2.tar.gz",
  "/tmp/scratchpad/notes.txt",
  "/lib/modules/kernel/drivers/net/wireless/ath.ko",
  "/mnt/storage/movies/sci-fi/interstellar.mp4",
  "/dev/shm/queue_processed.dat",
  "/root/.ssh/authorized_keys",
  "/etc/netplan/01-netcfg.yaml",
  "/usr/share/nginx/html/index.html",
  "/home/runner/work/repo/build/output.js",
  "/var/mail/root/inbox.mbox",
  "/opt/redis/conf/redis.conf",
  "/Users/guest/Desktop/screenshot_12.jpeg",
  "/app/config/environments/production.json",
]

const benchSafeParse = (fn: typeof safeParsePath) => {
  for (const path in examplePaths) {
    fn(`https://example.com/media${path}`, path)
  }

  for (const path in examplePaths) {
    fn(`https://example.com/media${path}`, path)
  }

  for (const path in examplePaths) {
    fn(`https://example.com/media${path}`, path)
  }

  fn("https://example.com/foo/a/foo", "/a/foo")

  fn("https://example.com/foo/baa/baa", "/baa")

  fn("https://example.com/foo/baa/baa/foo", "/baa/foo")

  fn("https://example.com/x/y/x", "/x")

  fn("https://example.com/x/y/x/z", "/x/z")

  fn("https://example.com/x/y/y", "/y")

  fn("https://example.com/x/y/y/z", "/y/z")

  fn("https://example.com/foo/a/foo?x=1&y=2", "/a/foo")

  fn("https://example.com/foo/%E2%9C%93", "/%E2%9C%93")

  fn("https://example.com/foo/foo", "/foo")

  fn("https://example.com/foo/foo/baa", "/foo/baa")

  fn("https://example.com/foo/foo/baa/ram", "/foo/baa/ram")

  fn("https://example.com/x/y/x/y/z", "/x/y/z")

  fn("https://example.com/x/y/x/y/z/a", "/x/y/z/a")

  fn("https://example.com/foo/foo/bar?a=1", "/foo/bar")

  fn("not a url", "/foo")

  fn("", "/foo")

  fn("/foo/bar", "/bar")

  fn("https://example.com/foo/bar", "")

  fn("https://example.com/foo/bar", "bar")

  fn("https://example.com/foo/bar", "/baz")

  fn("https://example.com/foo/barbaz", "/baz")

  fn("https://example.com/foo", "/foo/bar")

  fn("https://example.com/foo/foo/bar/", "/foo/bar/")

  fn("https://example.com/foo/a/bar/", "/a/bar/")

  fn("https://example.com/foo", "/foo")

  fn("https://example.com/", "/")

  fn("https://example.com/foo//foo/bar", "/foo/bar")

  fn("https://example.com/foo/barbaz", "/baz")

  fn("https://example.com/a/b/c/d/e/f/g", "/e/f/g")

  fn("https://example.com/a/b/c/a/b/c/d", "/a/b/c/d")
}

bench("safeParsePath", () => benchSafeParse(safeParsePath))
bench("safeParseFast", () => benchSafeParse(safeParseFast))
