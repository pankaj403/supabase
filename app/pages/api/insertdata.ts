import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/superbase'
interface InsertDataRequest {
  name: string
  clientId: number
  status: string
  startDate: string
  endDate: string
  calls: number
  successRate: string
  goals: string
  results: string
  notes:string
  dailyCallLimit:number
  callWindowStart:string
  callWindowEnd:string
  timeZone:string
  voicemailDetection:Boolean
  maxAttempts:number
  callInterval:string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { name,
            clientId,
            status,
            startDate,
            endDate,
            calls,
            successRate,
            goals,
            results,
            notes,
            dailyCallLimit,
            callWindowStart,
            callWindowEnd,
            timeZone,
            voicemailDetection,
            maxAttempts,
            callInterval}
        : InsertDataRequest = req.body

    // Insert data into Supabase table (replace 'your_table' with your actual table name)
    const { data, error } = await supabase
      .from('compaigns') // Replace 'your_table' with your table name
      .insert([{ name,
        clientId,
        status,
            startDate,
            endDate,
            calls,
            successRate,
            goals,
            results,
            notes,
           dailyCallLimit,
            callWindowStart,
           callWindowEnd,
           timeZone,
           voicemailDetection,
            maxAttempts,
           callInterval }])

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Data inserted successfully', data })
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
}
