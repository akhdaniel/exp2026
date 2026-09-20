import { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RATE, MIN_FLOOR, fmtIDR, computeWage, computePaid } from './logic.js'

const todayLabel = () => {
  const d = new Date()
  return d.getDate() + ' ' + d.toLocaleString('en', { month: 'short' })
}

const ICONS = {
  check: <polyline points="20 6 9 17 4 12" />,
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </>
  ),
  bars: (
    <>
      <line x1="4" y1="20" x2="4" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="20" y1="20" x2="20" y2="14" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M15 15h3" />
    </>
  ),
  sync: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
      <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  back: <polyline points="15 18 9 12 15 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </>
  ),
}

function Icon({ name, size = 22, stroke = 2, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {ICONS[name]}
    </svg>
  )
}

function TopBar({ title, onBack }) {
  return (
    <div className="topbar">
      <button className="back" aria-label="Back" onClick={onBack}>
        <Icon name="back" size={18} stroke={2.2} />
      </button>
      <div className="title">{title}</div>
    </div>
  )
}

function BottomNav({ active, go }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'sync', label: 'Sync', icon: 'sync' },
    { id: 'wages', label: 'Wages', icon: 'card' },
  ]
  return (
    <nav className="tabbar">
      {items.map((it) => (
        <button
          key={it.id}
          className={'tab' + (active === it.id ? ' active' : '')}
          onClick={() => go(it.id)}
        >
          <Icon name={it.icon} stroke={active === it.id ? 2.2 : 2} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  )
}

function Home({ state, go }) {
  const actions = [
    { label: 'Check In', icon: 'qr', to: 'checkin' },
    { label: 'Log Harvest', icon: 'bars', to: 'harvest' },
    { label: 'Request Leave', icon: 'calendar', to: 'leave' },
    { label: 'My Wages', icon: 'card', to: 'wages' },
  ]
  return (
    <div className="screen">
      <div>
        <div className="h1">Field App</div>
        <div className="subtitle">Bambang · Block A3, Riau</div>
      </div>

      <div className="hero">
        <div className="eyebrow">Today · {todayLabel()}</div>
        <div className="hero-value">
          <Icon
            name="check"
            size={26}
            stroke={2.4}
            style={{ color: 'var(--green)' }}
          />
          <span>Checked in {state.checkInTime}</span>
        </div>
        <div className="chip">
          <span className="dot" />
          <span>{state.queue.length} records queued for sync</span>
        </div>
      </div>

      <div className="grid">
        {actions.map((a) => (
          <button key={a.label} className="action" onClick={() => go(a.to)}>
            <Icon name={a.icon} size={26} />
            <span className="label">{a.label}</span>
          </button>
        ))}
      </div>

      <button className="link-row" onClick={() => go('sync')}>
        <div className="l">
          <Icon name="sync" size={20} />
          <div>
            <div className="title">Sync status</div>
            <div className="sub">
              {state.queue.length} queued · last synced {state.lastSynced}
            </div>
          </div>
        </div>
        <span className="chev">›</span>
      </button>
    </div>
  )
}

function CheckIn({ scanned, onScan, onConfirm, go }) {
  return (
    <div className="screen">
      <TopBar title="Check In" onBack={() => go('home')} />

      {scanned ? (
        <div className="screen--center" style={{ padding: 0 }}>
          <div className="check-circle">
            <Icon name="check" size={46} stroke={2.6} style={{ color: 'var(--bg)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="h2" style={{ fontSize: 22 }}>Site detected</div>
            <div className="body-text">Block A3 · Riau · 06:02</div>
          </div>
          <button className="btn" onClick={onConfirm}>Confirm check-in</button>
        </div>
      ) : (
        <div className="screen--center" style={{ padding: 0 }}>
          <div className="scan-box">
            <Icon name="qr" size={90} stroke={1.6} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="body-text">
            Point your camera at the site QR code posted at the Block A3 muster point
          </div>
          <button className="btn" onClick={onScan}>Tap to scan</button>
        </div>
      )}

      <div className="note">
        Works offline — the check-in is saved on this phone and uploaded once a signal is found
      </div>
    </div>
  )
}

function CheckedIn({ queueLen, go }) {
  return (
    <div className="screen screen--center dark">
      <div className="check-circle check-circle--sm">
        <Icon name="check" size={50} stroke={2.6} style={{ color: 'var(--bg)' }} />
      </div>
      <div>
        <div className="finish-title">Checked in</div>
        <div className="finish-sub">
          Block A3, Riau · 06:02
          <br />
          Saved on this phone — will sync automatically
        </div>
      </div>
      <div className="chip" style={{ fontSize: 13, padding: '10px 18px' }}>
        {queueLen} records now queued for sync
      </div>
      <button className="btn" style={{ marginTop: 14 }} onClick={() => go('home')}>
        Back to home
      </button>
    </div>
  )
}

function Harvest({ weight, setWeight, onSubmit, go }) {
  const wage = computeWage(weight)
  return (
    <div className="screen">
      <TopBar title="Log Harvest" onBack={() => go('home')} />

      <div className="info-card">Block A3 · Team 4 · Fresh Fruit Bunch (FFB)</div>

      <div className="hero hero--weight">
        <div className="eyebrow">Weight harvested</div>
        <div className="hero-value">{weight} kg</div>
        <input
          className="slider"
          type="range"
          min="0"
          max="300"
          step="1"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
      </div>

      <div className="ledger">
        <div className="l">
          <span className="k">Rate per kg</span>
          <span className="v">Rp 2,500 (illustrative)</span>
        </div>
        <div className="l">
          <span className="k">Computed wage</span>
          <span className="v strong">{fmtIDR(wage)}</span>
        </div>
        <div className="note note--left">
          Final pay is the higher of the computed wage and the regional minimum wage floor
        </div>
      </div>

      <div className="spacer" />
      <button className="btn" onClick={onSubmit}>Submit weight</button>
    </div>
  )
}

function Harvested({ go }) {
  return (
    <div className="screen screen--center dark">
      <div className="check-circle check-circle--sm">
        <Icon name="check" size={50} stroke={2.6} style={{ color: 'var(--bg)' }} />
      </div>
      <div>
        <div className="finish-title">Harvest logged</div>
        <div className="finish-sub">
          Block A3, Team 4
          <br />
          Saved locally — will sync to Inventory automatically
        </div>
      </div>
      <div className="chip" style={{ borderRadius: 16, padding: '14px 20px' }}>
        Weight is provisional until confirmed by the mill
      </div>
      <button className="btn" style={{ marginTop: 14 }} onClick={() => go('home')}>
        Back to home
      </button>
    </div>
  )
}

const LEAVE_TYPES = ['Annual', 'Sick', 'Unpaid']

function RequestLeave({ leaveType, setLeaveType, reason, setReason, onSubmit, go }) {
  return (
    <div className="screen">
      <TopBar title="Request Leave" onBack={() => go('home')} />

      <div className="info-card">
        <Icon name="calendar" size={18} style={{ color: 'var(--accent)' }} />
        Calendar C · Kalimantan region
      </div>

      <div>
        <div className="field-label" style={{ marginBottom: 10 }}>Leave type</div>
        <div className="type-row">
          {LEAVE_TYPES.map((t) => (
            <button
              key={t}
              className={'type-btn' + (leaveType === t ? ' active' : '')}
              onClick={() => setLeaveType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="date-grid">
        <div className="date-box">
          <div className="k">From</div>
          <div className="v">24 Sep 2026</div>
        </div>
        <div className="date-box">
          <div className="k">To</div>
          <div className="v">25 Sep 2026</div>
        </div>
      </div>

      <div>
        <div className="field-label" style={{ marginBottom: 8 }}>Reason (optional)</div>
        <div className="reason">
          <textarea
            rows={3}
            placeholder="Family event in home village"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      <div className="spacer" />
      <button className="btn" onClick={onSubmit}>Send for approval</button>
    </div>
  )
}

function LeaveSubmitted({ leaveType, go }) {
  return (
    <div className="screen screen--center dark">
      <div className="finish-icon" style={{ background: 'var(--amber)' }}>
        <Icon name="clock" size={46} stroke={2.4} style={{ color: 'var(--ink)' }} />
      </div>
      <div>
        <div className="finish-title">Sent for approval</div>
        <div className="finish-sub">
          {leaveType} leave · 24–25 Sep 2026
          <br />
          Your supervisor at Block A3 will review this against Calendar C
        </div>
      </div>
      <button className="btn" style={{ marginTop: 14 }} onClick={() => go('home')}>
        Back to home
      </button>
    </div>
  )
}

function SyncStatus({ queue, lastSynced, syncing, onSync, go }) {
  return (
    <div className="screen screen--flat">
      <div className="screen" style={{ padding: 24, gap: 20 }}>
        <TopBar title="Sync Status" onBack={() => go('home')} />

        <div className="hero hero--big hero--center">
          <div className="hero-value">{queue.length}</div>
          <div className="eyebrow" style={{ color: 'var(--label)' }}>
            {queue.length ? 'records queued' : 'nothing queued'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Last synced: {lastSynced}
          </div>
        </div>

        <div className="rows">
          <div className="field-label">Queue</div>
          {queue.length === 0 ? (
            <div className="row-line">
              <span className="k">All caught up</span>
              <span className="v" style={{ color: 'var(--green)' }}>Synced</span>
            </div>
          ) : (
            queue.map((q) => (
              <div className="row-line" key={q.id}>
                <span className="k">{q.label}</span>
                <span className="v" style={{ color: 'var(--amber)', fontWeight: 500 }}>
                  Pending
                </span>
              </div>
            ))
          )}
        </div>

        <div className="spacer" />
        <button className="btn" onClick={onSync} disabled={syncing || queue.length === 0}>
          {syncing ? 'Syncing…' : queue.length ? 'Sync now' : 'Nothing to sync'}
        </button>
      </div>
      <BottomNav active="sync" go={go} />
    </div>
  )
}

function Wages({ weekKg, todayKg, go }) {
  const weekTotal = computeWage(weekKg)
  const computed = computeWage(todayKg)
  const paid = computePaid(todayKg)
  const days = 4
  return (
    <div className="screen screen--flat">
      <div className="screen" style={{ padding: 24, gap: 18 }}>
        <TopBar title="My Wages" onBack={() => go('home')} />

        <div className="hero hero--coin">
          <div className="eyebrow">This week so far</div>
          <div className="hero-value">{fmtIDR(weekTotal)}</div>
          <div style={{ fontSize: 13, color: 'var(--soft)' }}>
            {days} days worked · {weekKg} kg harvested
          </div>
        </div>

        <div className="field-label">Today, {todayLabel()}</div>
        <div className="ledger">
          <div className="l">
            <span className="k">Harvest recorded</span>
            <span className="v">{todayKg} kg</span>
          </div>
          <div className="l">
            <span className="k">Rate per kg</span>
            <span className="v">Rp 2,500</span>
          </div>
          <div className="sep" />
          <div className="l">
            <span className="k">Computed wage</span>
            <span className="v">{fmtIDR(computed)}</span>
          </div>
          <div className="l">
            <span className="k">Minimum wage floor</span>
            <span className="v">{fmtIDR(MIN_FLOOR)}</span>
          </div>
          <div className="l paid">
            <span className="k">Paid amount</span>
            <span className="v">{fmtIDR(paid)}</span>
          </div>
        </div>
        <div className="note note--left">Figures shown are illustrative for this prototype</div>
      </div>
      <BottomNav active="wages" go={go} />
    </div>
  )
}

const STORAGE_KEY = 'field-app-prototype'

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

const initialState = {
  checkInTime: '06:02',
  lastSynced: '2h ago',
  todayKg: 145,
  weekKg: 725,
  queue: [
    { id: 1, kind: 'checkin', label: 'Check-in · 06:02' },
    { id: 2, kind: 'harvest', label: 'Harvest · 145 kg' },
    { id: 3, kind: 'leave', label: 'Leave request' },
  ],
}

let nextId = 100

function App() {
  const [screen, setScreen] = useState('home')
  const [scanned, setScanned] = useState(false)
  const [weight, setWeight] = useState(145)
  const [leaveType, setLeaveType] = useState('Annual')
  const [reason, setReason] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [state, setState] = useState(() => loadState() || initialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const go = (to) => setScreen(to)

  const confirmCheckIn = () => {
    setState((s) => ({
      ...s,
      checkInTime: '06:02',
      queue: [...s.queue, { id: nextId++, kind: 'checkin', label: 'Check-in · 06:02' }],
    }))
    setScanned(false)
    setScreen('checkedin')
  }

  const submitHarvest = () => {
    setState((s) => ({
      ...s,
      todayKg: weight,
      weekKg: s.weekKg + weight,
      queue: [...s.queue, { id: nextId++, kind: 'harvest', label: `Harvest · ${weight} kg` }],
    }))
    setScreen('harvested')
  }

  const submitLeave = () => {
    setState((s) => ({
      ...s,
      queue: [...s.queue, { id: nextId++, kind: 'leave', label: 'Leave request' }],
    }))
    setScreen('leavedone')
  }

  const doSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setState((s) => ({ ...s, queue: [], lastSynced: 'Just now' }))
      setSyncing(false)
    }, 700)
  }

  let view
  switch (screen) {
    case 'checkin':
      view = (
        <CheckIn
          scanned={scanned}
          onScan={() => setScanned(true)}
          onConfirm={confirmCheckIn}
          go={go}
        />
      )
      break
    case 'checkedin':
      view = <CheckedIn queueLen={state.queue.length} go={go} />
      break
    case 'harvest':
      view = (
        <Harvest
          weight={weight}
          setWeight={setWeight}
          onSubmit={submitHarvest}
          go={go}
        />
      )
      break
    case 'harvested':
      view = <Harvested go={go} />
      break
    case 'leave':
      view = (
        <RequestLeave
          leaveType={leaveType}
          setLeaveType={setLeaveType}
          reason={reason}
          setReason={setReason}
          onSubmit={submitLeave}
          go={go}
        />
      )
      break
    case 'leavedone':
      view = <LeaveSubmitted leaveType={leaveType} go={go} />
      break
    case 'sync':
      view = (
        <SyncStatus
          queue={state.queue}
          lastSynced={state.lastSynced}
          syncing={syncing}
          onSync={doSync}
          go={go}
        />
      )
      break
    case 'wages':
      view = <Wages weekKg={state.weekKg} todayKg={state.todayKg} go={go} />
      break
    default:
      view = <Home state={state} go={go} />
  }

  return <div className="app">{view}</div>
}

createRoot(document.getElementById('root')).render(<App />)