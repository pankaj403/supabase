// "use client"
// import { useState } from 'react'

// const Home = () => {
//   const [name, setName] = useState('')
//   const [clientId, setClientId] = useState(0)
//   const [status, setStatus] = useState('')
//   const [startDate, setStartDate] = useState('')
//   const [endDate, setEndDate] = useState('')
//   const [calls, setCalls] = useState(0)
//   const [successRate, setSuccessRate] = useState('')
//   const [goals, setGoals] = useState('')
//   const [results, setResults] = useState('')
//   const [notes, setNotes] = useState('')
//   const [dailyCallLimit, setDailyCallLimit] = useState(0)
//   const [callWindowStart, setCallWindowStart] = useState('')
//   const [callWindowEnd, setCallWindowEnd] = useState('')
//   const [timeZone, setTimeZone] = useState('')
//   const [voicemailDetection, setVoicemailDetection] = useState(false)
//   const [maxAttempts, setMaxAttempts] = useState(0)
//   const [callInterval, setCallInterval] = useState('')
//   const [message, setMessage] = useState('')

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault()

//     const requestData = {
//       name,
//       clientId,
//       status,
//       startDate,
//       endDate,
//       calls,
//       successRate,
//       goals,
//       results,
//       notes,
//       dailyCallLimit,
//       callWindowStart,
//       callWindowEnd,
//       timeZone,
//       voicemailDetection,
//       maxAttempts,
//       callInterval,
//     }

//     const response = await fetch('/api/insertdata', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(requestData),
//     })

//     const data = await response.json()

//     if (response.ok) {
//       setMessage('Data inserted successfully!')
//     } else {
//       setMessage(`Error: ${data.error}`)
//     }
//   }

//   return (
//     <div>
//       <h1>Insert Data into Supabase</h1>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>Name:</label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Client ID:</label>
//           <input
//             type="number"
//             value={clientId}
//             onChange={(e) => setClientId(Number(e.target.value))}
//           />
//         </div>
//         <div>
//           <label>Status:</label>
//           <input
//             type="text"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Start Date:</label>
//           <input
//             type="date"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>End Date:</label>
//           <input
//             type="date"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Calls:</label>
//           <input
//             type="number"
//             value={calls}
//             onChange={(e) => setCalls(Number(e.target.value))}
//           />
//         </div>
//         <div>
//           <label>Success Rate:</label>
//           <input
//             type="text"
//             value={successRate}
//             onChange={(e) => setSuccessRate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Goals:</label>
//           <input
//             type="text"
//             value={goals}
//             onChange={(e) => setGoals(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Results:</label>
//           <input
//             type="text"
//             value={results}
//             onChange={(e) => setResults(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Notes:</label>
//           <input
//             type="text"
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Daily Call Limit:</label>
//           <input
//             type="number"
//             value={dailyCallLimit}
//             onChange={(e) => setDailyCallLimit(Number(e.target.value))}
//           />
//         </div>
//         <div>
//           <label>Call Window Start:</label>
//           <input
//             type="time"
//             value={callWindowStart}
//             onChange={(e) => setCallWindowStart(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Call Window End:</label>
//           <input
//             type="time"
//             value={callWindowEnd}
//             onChange={(e) => setCallWindowEnd(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Time Zone:</label>
//           <input
//             type="text"
//             value={timeZone}
//             onChange={(e) => setTimeZone(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Voicemail Detection:</label>
//           <input
//             type="checkbox"
//             checked={voicemailDetection}
//             onChange={(e) => setVoicemailDetection(e.target.checked)}
//           />
//         </div>
//         <div>
//           <label>Max Attempts:</label>
//           <input
//             type="number"
//             value={maxAttempts}
//             onChange={(e) => setMaxAttempts(Number(e.target.value))}
//           />
//         </div>
//         <div>
//           <label>Call Interval:</label>
//           <input
//             type="text"
//             value={callInterval}
//             onChange={(e) => setCallInterval(e.target.value)}
//           />
//         </div>
//         <button type="submit">Submit</button>
//       </form>
//       {message && <p>{message}</p>}
//     </div>
//   )
// }

// export default Home



"use client"
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/superbase'

interface Campaign {
  id: any
  name: any
//   clientId: any
}

const Home = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  // Fetch data from Supabase using useEffect
  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('call') // Replace with your table name
        .select('*') 
       console.log("SDf")
      if (error) {
        console.error('Error fetching data:', error.message)
      } else {
        console.log(data,"Sd")
        setCampaigns(data)
      }
    }

    fetchCampaigns()
  }, [supabase])

  return (
    <div>
      <h1>Campaigns</h1>
      <ul>
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <h3>{campaign.name}</h3>
            {/* <p>Client ID: {campaign.clientId}</p> */}

            {/* Add more details here as needed */}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Home



