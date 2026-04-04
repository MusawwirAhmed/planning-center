import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

const COLORS = ['#5DCAA5', '#7F77DD', '#378ADD', '#EF9F27', '#D85A30', '#D4537E']

const css = `
  .app { background: #111; min-height: 100vh; padding: 24px 16px 40px; max-width: 480px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .date-main { font-size: 24px; font-weight: 600; color: #f0f0f0; }
  .date-sub { font-size: 15px; color: #666; margin-top: 3px; }
  .signout { background: transparent; border: 1px solid #2a2a2a; border-radius: 10px; padding: 8px 14px; color: #666; font-size: 13px; cursor: pointer; }
  .section { background: #1a1a1a; border-radius: 18px; padding: 20px; margin-bottom: 16px; border: 1px solid #2a2a2a; }
  .sec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .sec-title { font-size: 13px; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 0.08em; }
  .add-btn { width: 30px; height: 30px; border-radius: 50%; background: #222; border: 1px solid #333; color: #aaa; font-size: 22px; line-height: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
  .add-btn:hover { background: #5DCAA5; border-color: #5DCAA5; color: #111; }
  .time-block { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid #1f1f1f; }
  .time-block:last-child { border-bottom: none; padding-bottom: 0; }
  .time-label { font-size: 14px; color: #555; min-width: 56px; }
  .block-bar { width: 4px; height: 38px; border-radius: 4px; flex-shrink: 0; }
  .block-title { font-size: 18px; font-weight: 500; color: #f0f0f0; }
  .block-sub { font-size: 13px; color: #555; margin-top: 3px; }
  .task-row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid #1f1f1f; cursor: pointer; }
  .task-row:last-child { border-bottom: none; padding-bottom: 0; }
  .checkbox { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #444; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .checkbox.done { background: #5DCAA5; border-color: #5DCAA5; }
  .checkmark { width: 7px; height: 11px; border: 2px solid #111; border-top: none; border-left: none; transform: rotate(45deg) translateY(-1px); display: none; }
  .done .checkmark { display: block; }
  .task-text { font-size: 18px; color: #f0f0f0; flex: 1; }
  .task-text.done { color: #444; text-decoration: line-through; }
  .dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .cal-tabs { display: flex; gap: 8px; }
  .tab { font-size: 14px; padding: 7px 16px; border-radius: 20px; border: 1px solid #2a2a2a; color: #666; background: transparent; cursor: pointer; }
  .tab.active { background: #5DCAA5; color: #111; border-color: #5DCAA5; font-weight: 600; }
  .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }
  .cal-dl { font-size: 12px; color: #444; padding: 4px 0 10px; font-weight: 500; }
  .cal-day { font-size: 16px; color: #666; padding: 9px 4px; border-radius: 10px; cursor: pointer; }
  .cal-day.today { background: #5DCAA5; color: #111; font-weight: 600; }
  .cal-day.active-day { color: #f0f0f0; }
  .cal-day.other { color: #2a2a2a; }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
  .modal { background: #1a1a1a; border-radius: 22px 22px 0 0; padding: 28px 20px 40px; width: 100%; max-width: 480px; border-top: 1px solid #2a2a2a; }
  .modal-title { font-size: 20px; font-weight: 600; color: #f0f0f0; margin-bottom: 22px; }
  .field-label { font-size: 13px; color: #666; margin-bottom: 7px; display: block; }
  .field-input { width: 100%; background: #111; border: 1px solid #2a2a2a; border-radius: 12px; padding: 14px 16px; color: #f0f0f0; font-size: 17px; margin-bottom: 16px; outline: none; font-family: inherit; }
  .field-input:focus { border-color: #5DCAA5; }
  .color-row { display: flex; gap: 12px; margin-bottom: 24px; }
  .cdot { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; }
  .cdot.sel { border-color: #f0f0f0; transform: scale(1.15); }
  .modal-actions { display: flex; gap: 10px; }
  .btn-cancel { flex: 1; padding: 15px; border-radius: 14px; border: 1px solid #2a2a2a; background: transparent; color: #666; font-size: 17px; cursor: pointer; }
  .btn-add { flex: 2; padding: 15px; border-radius: 14px; border: none; background: #5DCAA5; color: #111; font-size: 17px; font-weight: 600; cursor: pointer; }
  .empty { color: #333; font-size: 15px; padding: 8px 0; }
  .loading { color: #444; font-size: 15px; text-align: center; padding: 20px; }
`

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${(hr % 12) || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

function today() { return new Date().toISOString().split('T')[0] }
function formatHeader() {
  return new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function Dashboard({ user }) {
  const [schedule, setSchedule] = useState([])
  const [tasks, setTasks] = useState([])
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calView, setCalView] = useState('week')
  const [form, setForm] = useState({ title: '', time: '', note: '', color: COLORS[0] })

  const fetchData = useCallback(async () => {
    const date = today()
    const [{ data: sch }, { data: tsk }] = await Promise.all([
      supabase.from('schedule_items').select('*').eq('user_id', user.id).eq('date', date).order('time'),
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('date', date).order('created_at'),
    ])
    setSchedule(sch || [])
    setTasks(tsk || [])
    setLoading(false)
  }, [user.id])

  useEffect(() => { fetchData() }, [fetchData])

  function openModal(type) {
    setForm({ title: '', time: '', note: '', color: COLORS[0] })
    setModal(type)
  }

  async function addItem() {
    if (!form.title.trim()) return
    if (modal === 'schedule') {
      const { data } = await supabase.from('schedule_items').insert({
        user_id: user.id, title: form.title, time: form.time, note: form.note, color: form.color, date: today()
      }).select()
      if (data) setSchedule(prev => [...prev, ...data].sort((a, b) => a.time > b.time ? 1 : -1))
    } else {
      const { data } = await supabase.from('tasks').insert({
        user_id: user.id, title: form.title, color: form.color, done: false, date: today()
      }).select()
      if (data) setTasks(prev => [...prev, ...data])
    }
    setModal(null)
  }

  async function toggleTask(task) {
    const newDone = !task.done
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone } : t))
    await supabase.from('tasks').update({ done: newDone }).eq('id', task.id)
  }

  function buildCal() {
    const now = new Date()
    const todayStr = today()
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    const headers = days.map(d => <div key={d} className="cal-dl">{d}</div>)
    if (calView === 'week') {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      const cells = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i)
        const str = d.toISOString().split('T')[0]
        return <div key={i} className={`cal-day ${str === todayStr ? 'today' : 'active-day'}`}>{d.getDate()}</div>
      })
      return [...headers, ...cells]
    } else {
      const year = now.getFullYear(), month = now.getMonth()
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const prevDays = new Date(year, month, 0).getDate()
      const cells = []
      for (let i = firstDay - 1; i >= 0; i--) cells.push(<div key={'p'+i} className="cal-day other">{prevDays - i}</div>)
      for (let d = 1; d <= daysInMonth; d++) {
        const str = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
        cells.push(<div key={d} className={`cal-day ${str === todayStr ? 'today' : 'active-day'}`}>{d}</div>)
      }
      return [...headers, ...cells]
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="date-main">{formatHeader()}</div>
            <div className="date-sub">Spring Season · Planning Center</div>
          </div>
          <button className="signout" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>

        <div className="section">
          <div className="sec-header">
            <div className="sec-title">Today's Schedule</div>
            <div className="add-btn" onClick={() => openModal('schedule')}>+</div>
          </div>
          {loading ? <div className="loading">Loading...</div> : schedule.length === 0
            ? <div className="empty">No meetings yet — tap + to add one</div>
            : schedule.map(item => (
              <div key={item.id} className="time-block">
                <div className="time-label">{formatTime(item.time)}</div>
                <div className="block-bar" style={{ background: item.color }} />
                <div>
                  <div className="block-title">{item.title}</div>
                  {item.note && <div className="block-sub">{item.note}</div>}
                </div>
              </div>
            ))}
        </div>

        <div className="section">
          <div className="sec-header">
            <div className="sec-title">Today's Tasks</div>
            <div className="add-btn" onClick={() => openModal('task')}>+</div>
          </div>
          {loading ? <div className="loading">Loading...</div> : tasks.length === 0
            ? <div className="empty">No tasks yet — tap + to add one</div>
            : tasks.map(task => (
              <div key={task.id} className="task-row" onClick={() => toggleTask(task)}>
                <div className={`checkbox${task.done ? ' done' : ''}`}><div className="checkmark" /></div>
                <div className={`task-text${task.done ? ' done' : ''}`}>{task.title}</div>
                <div className="dot" style={{ background: task.color }} />
              </div>
            ))}
        </div>

        <div className="section">
          <div className="sec-header">
            <div className="sec-title">{calView === 'week' ? 'This Week' : new Date().toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}</div>
            <div className="cal-tabs">
              <button className={`tab${calView === 'week' ? ' active' : ''}`} onClick={() => setCalView('week')}>Week</button>
              <button className={`tab${calView === 'month' ? ' active' : ''}`} onClick={() => setCalView('month')}>Month</button>
            </div>
          </div>
          <div className="cal-grid">{buildCal()}</div>
        </div>
      </div>

      {modal && (
        <div className="overlay" onClick={e => e.target.classList.contains('overlay') && setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal === 'schedule' ? 'Add Meeting' : 'Add Task'}</div>
            <label className="field-label">Title</label>
            <input className="field-input" placeholder={modal === 'schedule' ? 'e.g. Team standup' : 'e.g. Reply to emails'} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            {modal === 'schedule' && <>
              <label className="field-label">Time</label>
              <input className="field-input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              <label className="field-label">Note (optional)</label>
              <input className="field-input" placeholder="e.g. Zoom call" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </>}
            <label className="field-label">Color</label>
            <div className="color-row">
              {COLORS.map(c => (
                <div key={c} className={`cdot${form.color === c ? ' sel' : ''}`} style={{ background: c }} onClick={() => setForm(f => ({ ...f, color: c }))} />
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-add" onClick={addItem}>Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
  }
