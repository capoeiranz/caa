import { Link } from "@tanstack/react-router"

import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

export function NotFound() {
  return (
    <div className="grid h-full place-content-center">
      <Card>
        <CardHeader>
          <CardTitle>404 - page not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The page you requested does not exist or may have moved.</p>
        </CardContent>
        <CardFooter>
          <CardAction>
            <Link to="/">Return home</Link>
          </CardAction>
        </CardFooter>
      </Card>
    </div>
  )
}
