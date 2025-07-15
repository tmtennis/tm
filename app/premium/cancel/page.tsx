import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PremiumCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-3xl font-bold">Payment Cancelled</h1>
          <p className="text-muted-foreground">
            Your payment was cancelled. You can try again anytime to upgrade to Premium.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
