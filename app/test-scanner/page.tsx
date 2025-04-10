"use client"

import { useState, useEffect } from 'react'
import { QrScanner } from '@/components/qr-scanner'
import { Client } from '@/lib/client-service'
import { Session } from '@/lib/session-service'

export default function TestScannerPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [scanResult, setScanResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch clients
        const clientsResponse = await fetch('/api/clients')
        if (!clientsResponse.ok) {
          throw new Error('Failed to fetch clients')
        }
        const clientsData = await clientsResponse.json()
        setClients(clientsData)
        
        // Fetch sessions
        const sessionsResponse = await fetch('/api/sessions')
        if (!sessionsResponse.ok) {
          throw new Error('Failed to fetch sessions')
        }
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData)
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load data')
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Handle QR code scanning
  const handleQRCodeScan = async (clientId: string, notes?: string) => {
    try {
      console.log('QR code scan with client ID:', clientId)
      
      if (!clientId) {
        throw new Error("Invalid QR code")
      }
      
      // Find client by ID to confirm it exists
      console.log('Looking for client in client list:', clients.length, 'clients')
      const client = clients.find(c => c.id === clientId)
      console.log('Client match result:', client ? `Found: ${client.name}` : 'Not found')
      
      if (!client) {
        throw new Error("Client not found for ID: " + clientId)
      }
      
      // Use the first session as a fallback (simplified for testing)
      const sessionId = sessions[0]?.id
      
      if (!sessionId) {
        throw new Error("No sessions available")
      }
      
      console.log('Using session ID for test:', sessionId)
      
      // Record attendance via API
      const response = await fetch('/api/attendance/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          sessionId,
          notes,
          status: 'present'
        }),
      })
      
      console.log('API response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to record attendance")
      }
      
      const result = await response.json()
      
      // Save the scan result
      setScanResult({
        success: true,
        clientName: client.name,
        sessionName: sessions.find(s => s.id === sessionId)?.name || 'Unknown Session',
        timestamp: new Date().toLocaleTimeString()
      })
      
      return result
    } catch (error) {
      console.error('Error processing scan:', error)
      setScanResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-cyan-800 mb-4">QR Scanner Test Page</h1>
      
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded">
            <p className="font-medium">Loaded {clients.length} clients and {sessions.length} sessions</p>
            <p className="text-sm text-gray-600 mt-1">Ready to scan QR codes</p>
          </div>
          
          <div className="border rounded shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-4">QR Scanner</h2>
            <QrScanner 
              onScanSuccess={handleQRCodeScan}
              clients={clients}
              currentSessionId={sessions[0]?.id}
            />
          </div>
          
          {scanResult && (
            <div className={`p-4 rounded border ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className="font-semibold">{scanResult.success ? 'Scan Successful!' : 'Scan Failed'}</h3>
              {scanResult.success ? (
                <div className="mt-2 space-y-1">
                  <p><span className="font-medium">Client:</span> {scanResult.clientName}</p>
                  <p><span className="font-medium">Session:</span> {scanResult.sessionName}</p>
                  <p><span className="font-medium">Time:</span> {scanResult.timestamp}</p>
                </div>
              ) : (
                <p className="mt-2 text-red-700">{scanResult.error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
