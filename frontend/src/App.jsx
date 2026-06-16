import { useState, useEffect } from 'react'
import './App.css'

const SPORTS = [
  { name: "Soccer", value: "soccer" },
  { name: "Basketball", value: "basketball" },
]

const LEAGUES = {
  soccer: [
    { name: "Premier League", value: "eng.1" },
    { name: "La Liga", value: "esp.1" },
    { name: "Champions League", value: "uefa.champions" },
  ],
  basketball: [
    { name: "NBA", value: "nba" },
  ]
}

const STEP_LABELS = ['Sport', 'League', 'Teams', 'Dates', 'Confirm']

function App() {
  const [step, setStep] = useState(1)
  const [sport, setSport] = useState(null)
  const [league, setLeague] = useState(null)
  const [teams, setTeams] = useState([])
  const [selected, setSelected] = useState([])
  const [beginDate, setBeginDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    if (!sport || !league) return
    fetch(`http://localhost:8000/teams/${sport}/${league}`)
      .then(response => response.json())
      .then(data => setTeams(data.teams))
  }, [sport, league])

  function toggleTeam(abbreviation) {
    if (selected.includes(abbreviation)) {
      setSelected(selected.filter(t => t !== abbreviation))
    } else {
      setSelected([...selected, abbreviation])
    }
  }

  function submitSchedule() {
    fetch('http://localhost:8000/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport,
        league,
        teams: selected,
        begin_date: beginDate,
        end_date: endDate
      })
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'calendar.ics'
        a.click()
      })
  }

  return (
    <div className="app">
      {/* Progress indicator */}
      <div className="progress">
        {STEP_LABELS.map((label, i) => (
          <div
            key={label}
            className={`progress-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Step 1 - Sport */}
      {step === 1 && (
        <div>
          <h2>Pick a sport</h2>
          <div className="choice-grid">
            {SPORTS.map(s => (
              <button
                key={s.value}
                className="choice-button"
                onClick={() => { setSport(s.value); setStep(2) }}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 - League */}
      {step === 2 && (
        <div>
          <h2>Pick a league</h2>
          <div className="choice-grid">
            {LEAGUES[sport].map(l => (
              <button
                key={l.value}
                className="choice-button"
                onClick={() => { setLeague(l.value); setStep(3) }}
              >
                {l.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 - Teams */}
      {step === 3 && (
        <div>
          <h2>Pick your teams</h2>
          <div className="team-grid">
            {teams.map(team => (
              <div
                key={team.abbreviation}
                className={`team-card ${selected.includes(team.abbreviation) ? 'selected' : ''}`}
                onClick={() => toggleTeam(team.abbreviation)}
              >
                <img src={team.logo} alt={team.name} />
                <span>{team.name}</span>
              </div>
            ))}
          </div>
          <button
            className="primary-button"
            onClick={() => setStep(4)}
            disabled={selected.length === 0}
          >
            Next
          </button>
        </div>
      )}

      {/* Step 4 - Dates */}
      {step === 4 && (
        <div>
          <h2>Pick a date range</h2>
          <div className="date-row">
            <div className="date-field">
              <label>Start date</label>
              <input type="date" value={beginDate} onChange={e => setBeginDate(e.target.value)} />
            </div>
            <div className="date-field">
              <label>End date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <button
            className="primary-button"
            onClick={() => setStep(5)}
            disabled={!beginDate || !endDate}
          >
            Next
          </button>
        </div>
      )}

      {/* Step 5 - Confirm */}
      {step === 5 && (
        <div>
          <h2>Confirm</h2>
          <div className="summary-row">
            <span className="summary-label">Sport</span>
            <span>{sport}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">League</span>
            <span>{league}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Teams</span>
            <span>{selected.join(', ')}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Dates</span>
            <span>{beginDate} to {endDate}</span>
          </div>
          <button className="primary-button" onClick={submitSchedule}>
            Create calendar
          </button>
        </div>
      )}
    </div>
  )
}

export default App