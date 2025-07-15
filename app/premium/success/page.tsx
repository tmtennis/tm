import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PremiumSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-3xl font-bold">Welcome to Premium!</h1>
          <p className="text-muted-foreground">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
