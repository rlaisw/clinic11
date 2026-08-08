"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ReceiptData {
  rref: string
  patient_name: string
  doctor_name: string
  doctor_display_name: string
  clinic_name: string
  date: string
  total_free: string
  total_dollars: string
  diagnosis: string
}

interface VerifyResponse {
  verified: boolean
  message: string
  receipt?: ReceiptData
}

export default function VerifyReceiptPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<VerifyResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    fetch(`${apiUrl}/verify-receipt/${token}/`)
      .then((r) => r.json())
      .then((d: VerifyResponse) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setData({ verified: false, message: "Failed to verify receipt" })
        setLoading(false)
      })
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data?.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{data?.message || "Receipt not found"}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const r = data.receipt!

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardContent className="p-6 space-y-6">
          <Alert>
            <AlertTitle className="text-lg font-bold text-center">Receipt</AlertTitle>
            <AlertDescription>
              Please carefully compare the data below with the hard copy of the receipt to ensure accuracy and consistency.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Row label="Reference No" value={r.rref} />
            <Row label="Patient Name" value={r.patient_name} />
            <Row label="Doctor Name" value={r.doctor_display_name || r.doctor_name} />
            <Row label="Clinic Name" value={r.clinic_name} />
            <Row label="Date" value={r.date} />
            <Row label="Total Amount" value={`$${r.total_free}`} />
            <Row label="Total in Words" value={r.total_dollars} />
            <Row label="Diagnosis" value={r.diagnosis} />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Badge variant={data.verified ? "default" : "destructive"}>
              {data.verified ? "Verified" : "Not Verified"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {data.message}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value || "—"}</span>
    </div>
  )
}