import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase'

const COLORS = ['#5DCAA5', '#7F77DD', '#378ADD', '#EF9F27', '#D85A30', '#D4537E']

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
  { label: '1.5 hr', value: 90 },
  { label: '2 hr', value: 120 },
]

const ALERT_OPTIONS = [
  { label: 'None', value: 0 },
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
]

const REPEAT_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly']

const css = `
* { box-sizing: border-box; }
.app { background: #111; min-height: 100vh; padding: 24px 16px 40px; max-width: 480px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.date-main { font-size: 24px; font-weight: 600; color: #f0f0f0; }
.date-sub { font-size: 15px; color: #666; margin-top: 3px; }
.signout { background: transparent; border: 1px solid #2a2a2a; border-radius: 10px; padding: 8px 14px; color: #666; font-size: 13px; cursor: pointer; }
.view-toggle { display: flex; gap: 8px; margin-bottom: 20px; }
.vtab { flex: 1; padding: 10px; border-radius: 14px; border: 1px solid #2a2a2a; color: #666; background: transparent; cursor: pointer; font-size: 15px; font-weight: 500; transition: all 0.15s; }
.vtab.active { background: #5DCAA5; color: #111; border-color: #5DCAA5; font-weight: 600; }
.section { background: #1a1a1a; border-radius: 18px; padding: 20px; margin-bottom: 16px; border: 1px solid #2a2a2a; }
.sec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.sec-title { font-size: 13px; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 0.08em; }
.add-btn { width: 30px; height: 30px; border-radius: 50%; background: #222; border: 1px solid #333; color: #aaa; font-size: 22px; line-height: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
.add-btn:hover { background: #5DCAA5; border-color: #5DCAA5; color: #111; }
.time-block { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid #1f1f1f; cursor: pointer; }
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
.cal-day { font-size: 16px; color: #666; padding: 9px 4px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
.cal-day:hover { background: #222; }
.cal-day.today { background: #5DCAA5; color: #111; font-weight: 600; }
.cal-day.active-day { color: #f0f0f0; }
.cal-day.other { color: #2a2a2a; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 100; display: flex; align-items: flex-end; justify-content: center; }
.modal { background: #1a1a1a; border-radius: 22px 22px 0 0; padding: 28px 20px 40px; width: 100%; max-width: 480px; border-top: 1px solid #2a2a2a; max-height: 90vh; overflow-y: auto; }
.modal-title { font-size: 20px; font-weight: 600; color: #f0f0f0; margin-bottom: 22px; }
.field-label { font-size: 13px; color: #666; margin-bottom: 7px; display: block; }
.field-input { width: 100%; background: #111; border: 1px solid #2a2a2a; border-radius: 12px; padding: 14px 16px; color: #f0f0f0; font-size: 17px; margin-bottom: 16px; outline: none; font-family: inherit; }
.field-input:focus { border-color: #5DCAA5; }
.field-select { width: 100%; background: #111; border: 1px solid #2a2a2a; border-radius: 12px; padding: 14px 16px; color: #f0f0f0; font-size: 17px; margin-bottom: 16px; outline: none; font-family: inherit; cursor: pointer; appearance: none; }
.field-select:focus { border-color: #5DCAA5; }
.chip-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.chip { padding: 7px 14px; border-radius: 20px; border: 1px solid #2a2a2a; color: #666; background: transparent; cursor: pointer; font-size: 14px; transition: all 0.15s; }
.chip.sel { background: #5DCAA5; color: #111; border-color: #5DCAA5; font-weight: 600; }
.color-row { display: flex; gap: 12px; margin-bottom: 24px; }
.cdot { width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: all 0.15s; }
.cdot.sel { border-color: #f0f0f0; transform: scale(1.15); }
.modal-actions { display: flex; gap: 10px; }
.btn-cancel { flex: 1; padding: 15px; border-radius: 14px; border: 1px solid #2a2a2a; background: transparent; color: #666; font-size: 17px; cursor: pointer; }
.btn-add { flex: 2; padding: 15px; border-radius: 14px; border: none; background: #5DCAA5; color: #111; font-size: 17px; font-weight: 600; cursor: pointer; }
.btn-delete { flex: 1; padding: 15px; border-radius: 14px; border: none; background: #D85A30; color: #fff; font-size: 17px; font-weight: 600; cursor: pointer; }
.empty { color: #333; font-size: 15px; padding: 8px 0; }
.loading { color: #444; font-size: 15px; text-align: center; padding: 20px; }

/* Timeline View */
.timeline-view { display: flex; gap: 12px; height: calc(100vh - 160px); min-height: 500px; }
.timeline-left { flex: 1; overflow-y: auto; background: #1a1a1a; border-radius: 18px; border: 1px solid #2a2a2a; position: relative; padding: 0; }
.timeline-right { width: 160px; display: flex; flex-direction: column; gap: 10px; }
.timeline-right-title { font-size: 12px; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.tl-task-item { background: #1a1a1a; border-radius: 12px; border: 1px solid #2a2a2a; padding: 10px 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.tl-task-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.tl-task-text { font-size: 13px; color: #f0f0f0; flex: 1; line-height: 1.3; }
.tl-task-text.done { color: #444; text-decoration: line-through; }
.tl-task-cb { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #444; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.tl-task-cb.done { background: #5DCAA5; border-color: #5DCAA5; }
.tl-task-ck { width: 5px; height: 8px; border: 2px solid #111; border-top: none; border-left: none; transform: rotate(45deg) translateY(-1px); display: none; }
.done .tl-task-ck { display: block; }

.tl-scroll { position: relative; height: 1440px; }
.tl-hour-row { position: absolute; left: 0; right: 0; display: flex; align-items: flex-start; }
.tl-hour-label { font-size: 11px; color: #444; width: 44px; padding: 0 8px; flex-shrink: 0; transform: translateY(-7px); }
.tl-hour-line { flex: 1; height: 1px; background: #222; margin-top: 0; }
.tl-event { position: absolute; left: 50px; right: 6px; border-radius: 8px; padding: 4px 8px; cursor: pointer; overflow: hidden; transition: opacity 0.15s; }
.tl-event:hover { opacity: 0.85; }
.tl-event-title { font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tl-event-time { font-size: 11px; color: rgba(255,255,255,0.7); }
.tl-now-line { position: absolute; left: 44px; right: 0; height: 2px; background: #5DCAA5; z-index: 5; }
.tl-now-dot { position: absolute; left: 40px; width: 8px; height: 8px; border-radius: 50%; background: #5DCAA5; top: -3px; }

.overlap-zone { position: absolute; left: 50px; right: 6px; border-radius: 8px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; }
.overlap-label { font-size: 11px; color: rgba(255,255,255,0.8); font-weight: 600; }

.tl-add-btn { position: absolute; bottom: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; background: #5DCAA5; border: none; color: #111; font-size: 24px; line-height: 1; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 12px rgba(93,202,165,0.3); }

.tl-date-header { padding: 12px 16px 8px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; }
.tl-date-label { font-size: 14px; font-weight: 600; color: #f0f0f0; }
.tl-back-btn { font-size: 13px; color: #5DCAA5; cursor: pointer; background: none; border: none; padding: 0; }

.overlap-popup { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200; display: flex; align-items: center; justify-content: center; }
.overlap-popup-inner { background: #1a1a1a; border-radius: 18px; padding: 20px; width: 280px; border: 1px solid #2a2a2a; }
.overlap-popup-title { font-size: 16px; font-weight: 600; color: #f0f0f0; margin-bottom: 14px; }
.overlap-popup-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #222; }
.overlap-popup-item:last-child { border-bottom: none; }
.overlap-popup-bar { width: 4px; height: 30px; border-radius: 4px; flex-shrink: 0; }
.overlap-popup-text { font-size: 14px; color: #f0f0f0; }
.overlap-popup-close { margin-top: 14px; width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #2a2a2a; background: transparent; color: #666; font-size: 15px; cursor: pointer; }
`

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${(hr % 12) || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function formatHeader() {
  return new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
}

function timeToMinutes(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function blendColors(colors) {
  if (colors.length === 0) return '#333'
  if (colors.length === 1) return colors[0]
  const rgbs = colors.map(hexToRgb)
  const avg = [0, 1, 2].map(i => Math.round(rgbs.reduce((s, c) => s + c[i], 0) / rgbs.length))
  return `rgb(${avg[0]}, ${avg[1]}, ${avg[2]})`
}

function scheduleNotification(title, body, delayMs) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (delayMs <= 0) return
  setTimeout(() => {
    new Notification(title, { body, icon: '/favicon.ico' })
  }, delayMs)
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

function blankMeetingForm() {
  return {
    title: '',
    time: '',
    duration: 30,
    alert: 0,
    repeat: 'Once',
    notes: '',
    color: COLORS[0],
  }
}

function blankTaskForm() {
  return { title: '', color: COLORS[0] }
}

export default function Dashboard({ user }) {
  const [schedule, setSchedule] = useState([])
  const [tasks, setTasks] = useState([])
  const [modal, setModal] = useState(null) // null | 'meeting' | 'task' | 'editMeeting' | 'editTask'
  const [loading, setLoading] = useState(true)
  const [calView, setCalView] = useState('week')
  const [view, setView] = useState('dashboard') // 'dashboard' | 'timeline'
  const [meetingForm, setMeetingForm] = useState(blankMeetingForm())
  const [taskForm, setTaskForm] = useState(blankTaskForm())
  const [editItem, setEditItem] = useState(null)
  const [overlapPopup, setOverlapPopup] = useState(null) // array of events
  const [timelineDate, setTimelineDate] = useState(todayStr())
  const [timelineSchedule, setTimelineSchedule] = useState([])
  const tlScrollRef = useRef(null)

  const fetchData = useCallback(async (date) => {
    const d = date || todayStr()
    const [{ data: sch }, { data: tsk }] = await Promise.all([
      supabase.from('schedule_items').select('*').eq('user_id', user.id).eq('date', d).order('time'),
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('date', d).order('created_at'),
    ])
    setSchedule(sch || [])
    setTasks(tsk || [])
    setLoading(false)
  }, [user.id])

  const fetchTimelineData = useCallback(async (date) => {
    const { data: sch } = await supabase
      .from('schedule_items').select('*')
      .eq('user_id', user.id).eq('date', date).order('time')
    setTimelineSchedule(sch || [])
  }, [user.id])

  useEffect(() => {
    fetchData(todayStr())
    requestNotificationPermission()
  }, [fetchData])

  useEffect(() => {
    if (view === 'timeline') {
      fetchTimelineData(timelineDate)
      // Scroll to current hour
      setTimeout(() => {
        if (tlScrollRef.current) {
          const now = new Date()
          const mins = now.getHours() * 60 + now.getMinutes()
          const px = (mins / 1440) * 1440
          tlScrollRef.current.scrollTop = Math.max(0, px - 150)
        }
      }, 100)
    }
  }, [view, timelineDate, fetchTimelineData])

  function openMeetingModal() {
    setMeetingForm(blankMeetingForm())
    setEditItem(null)
    setModal('meeting')
  }

  function openTaskModal() {
    setTaskForm(blankTaskForm())
    setEditItem(null)
    setModal('task')
  }

  function openEditMeeting(item, e) {
    e && e.stopPropagation()
    setMeetingForm({
      title: item.title || '',
      time: item.time || '',
      duration: item.duration || 30,
      alert: item.alert || 0,
      repeat: item.repeat || 'Once',
      notes: item.note || item.notes || '',
      color: item.color || COLORS[0],
    })
    setEditItem(item)
    setModal('editMeeting')
  }

  function openEditTask(item, e) {
    e && e.stopPropagation()
    setTaskForm({ title: item.title || '', color: item.color || COLORS[0] })
    setEditItem(item)
    setModal('editTask')
  }

  async function saveMeeting() {
    if (!meetingForm.title.trim()) return
    const payload = {
      user_id: user.id,
      title: meetingForm.title,
      time: meetingForm.time,
      duration: meetingForm.duration,
      alert: meetingForm.alert,
      repeat: meetingForm.repeat,
      note: meetingForm.notes,
      color: meetingForm.color,
      date: timelineDate || todayStr(),
    }

    if (modal === 'editMeeting' && editItem) {
      const { data } = await supabase.from('schedule_items').update(payload).eq('id', editItem.id).select()
      if (data) {
        setSchedule(prev => prev.map(i => i.id === editItem.id ? data[0] : i).sort((a, b) => a.time > b.time ? 1 : -1))
        setTimelineSchedule(prev => prev.map(i => i.id === editItem.id ? data[0] : i).sort((a, b) => a.time > b.time ? 1 : -1))
      }
    } else {
      const { data, error } = await supabase.from('schedule_items').insert(payload).select()
      if (data) {
        setSchedule(prev => [...prev, ...data].sort((a, b) => a.time > b.time ? 1 : -1))
        setTimelineSchedule(prev => [...prev, ...data].sort((a, b) => a.time > b.time ? 1 : -1))
        // Schedule notification
        if (meetingForm.alert > 0 && meetingForm.time) {
          const [h, m] = meetingForm.time.split(':').map(Number)
          const eventMs = new Date()
          eventMs.setHours(h, m, 0, 0)
          const alertMs = eventMs.getTime() - meetingForm.alert * 60000 - Date.now()
          scheduleNotification(
            `Upcoming: ${meetingForm.title}`,
            `Starts in ${meetingForm.alert} min`,
            alertMs
          )
        }
      }
      if (error) console.error('Insert error:', error)
    }
    setModal(null)
  }

  async function saveTask() {
    if (!taskForm.title.trim()) return
    const payload = {
      user_id: user.id,
      title: taskForm.title,
      color: taskForm.color,
      done: false,
      date: todayStr(),
    }
    if (modal === 'editTask' && editItem) {
      const { data } = await supabase.from('tasks').update({ title: taskForm.title, color: taskForm.color }).eq('id', editItem.id).select()
      if (data) setTasks(prev => prev.map(t => t.id === editItem.id ? data[0] : t))
    } else {
      const { data, error } = await supabase.from('tasks').insert(payload).select()
      if (data) setTasks(prev => [...prev, ...data])
      if (error) console.error('Insert error:', error)
    }
    setModal(null)
  }

  async function deleteMeeting() {
    if (!editItem) return
    await supabase.from('schedule_items').delete().eq('id', editItem.id)
    setSchedule(prev => prev.filter(i => i.id !== editItem.id))
    setTimelineSchedule(prev => prev.filter(i => i.id !== editItem.id))
    setModal(null)
  }

  async function deleteTask() {
    if (!editItem) return
    await supabase.from('tasks').delete().eq('id', editItem.id)
    setTasks(prev => prev.filter(t => t.id !== editItem.id))
    setModal(null)
  }

  async function toggleTask(task) {
    const newDone = !task.done
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: newDone } : t))
    await supabase.from('tasks').update({ done: newDone }).eq('id', task.id)
  }

  function buildCal() {
    const now = new Date()
    const tStr = todayStr()
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    const headers = days.map(d => <div key={d} className="cal-dl">{d}</div>)
    if (calView === 'week') {
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      const cells = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start); d.setDate(start.getDate() + i)
        const str = d.toISOString().split('T')[0]
        return (
          <div
            key={i}
            className={`cal-day ${str === tStr ? 'today' : 'active-day'}`}
            onDoubleClick={() => openTimelineForDate(str)}
          >
            {d.getDate()}
          </div>
        )
      })
      return [...headers, ...cells]
    } else {
      const year = now.getFullYear(), month = now.getMonth()
      const firstDay = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const prevDays = new Date(year, month, 0).getDate()
      const cells = []
      for (let i = firstDay - 1; i >= 0; i--) cells.push(<div key={'p' + i} className="cal-day other">{prevDays - i}</div>)
      for (let d = 1; d <= daysInMonth; d++) {
        const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        cells.push(
          <div
            key={d}
            className={`cal-day ${str === tStr ? 'today' : 'active-day'}`}
            onDoubleClick={() => openTimelineForDate(str)}
          >
            {d}
          </div>
        )
      }
      return [...headers, ...cells]
    }
  }

  function openTimelineForDate(dateStr) {
    setTimelineDate(dateStr)
    setView('timeline')
  }

  // ── Timeline rendering ─────────────────────────────────────────────────────
  function buildTimelineEvents() {
    const PX_PER_MIN = 1440 / 1440 // 1px per minute, total 1440px for 24h
    const events = timelineSchedule.map(item => {
      const startMin = timeToMinutes(item.time)
      const dur = item.duration || 30
      const top = startMin * PX_PER_MIN
      const height = Math.max(dur * PX_PER_MIN, 24)
      return { ...item, startMin, dur, top, height }
    })

    // Find overlaps
    const overlaps = findOverlaps(events)
    const rendered = []

    overlaps.groups.forEach((group, gi) => {
      if (group.length === 1) {
        const ev = group[0]
        rendered.push(
          <div
            key={ev.id}
            className="tl-event"
            style={{ top: ev.top, height: ev.height, background: ev.color }}
            onDoubleClick={() => openEditMeeting(ev)}
          >
            <div className="tl-event-title">{ev.title}</div>
            {ev.height >= 36 && <div className="tl-event-time">{formatTime(ev.time)}</div>}
          </div>
        )
      } else {
        // Overlap zone: show blend color
        const minTop = Math.min(...group.map(e => e.top))
        const maxBottom = Math.max(...group.map(e => e.top + e.height))
        const blended = blendColors(group.map(e => e.color))
        rendered.push(
          <div
            key={`overlap-${gi}`}
            className="overlap-zone"
            style={{
              top: minTop,
              height: maxBottom - minTop,
              background: blended,
              opacity: 0.85,
            }}
            onClick={() => setOverlapPopup(group)}
          >
            <span className="overlap-label">{group.length} events</span>
          </div>
        )
      }
    })

    return rendered
  }

  function findOverlaps(events) {
    // Group overlapping events
    const sorted = [...events].sort((a, b) => a.startMin - b.startMin)
    const groups = []
    const used = new Set()
    for (let i = 0; i < sorted.length; i++) {
      if (used.has(i)) continue
      const group = [sorted[i]]
      used.add(i)
      let maxEnd = sorted[i].startMin + sorted[i].dur
      for (let j = i + 1; j < sorted.length; j++) {
        if (used.has(j)) continue
        if (sorted[j].startMin < maxEnd) {
          group.push(sorted[j])
          used.add(j)
          maxEnd = Math.max(maxEnd, sorted[j].startMin + sorted[j].dur)
        }
      }
      groups.push(group)
    }
    return { groups }
  }

  function buildHourRows() {
    const PX_PER_MIN = 1
    return Array.from({ length: 25 }, (_, i) => {
      const label = i === 0 ? '' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`
      return (
        <div key={i} className="tl-hour-row" style={{ top: i * 60 * PX_PER_MIN }}>
          <div className="tl-hour-label">{label}</div>
          <div className="tl-hour-line" />
        </div>
      )
    })
  }

  function getNowLinePosition() {
    const now = new Date()
    const mins = now.getHours() * 60 + now.getMinutes()
    return mins
  }

  const nowPos = getNowLinePosition()
  const isToday = timelineDate === todayStr()

  // ── DASHBOARD VIEW ─────────────────────────────────────────────────────────
  const dashboardView = (
    <>
      <div className="section">
        <div className="sec-header">
          <div className="sec-title">Today's Schedule</div>
          <div className="add-btn" onClick={openMeetingModal}>+</div>
        </div>
        {loading ? <div className="loading">Loading...</div> :
          schedule.length === 0 ? <div className="empty">No meetings yet — tap + to add one</div> :
            schedule.map(item => (
              <div key={item.id} className="time-block" onDoubleClick={(e) => openEditMeeting(item, e)}>
                <div className="time-label">{formatTime(item.time)}</div>
                <div className="block-bar" style={{ background: item.color }} />
                <div>
                  <div className="block-title">{item.title}</div>
                  {(item.note || item.notes) && <div className="block-sub">{item.note || item.notes}</div>}
                </div>
              </div>
            ))}
      </div>

      <div className="section">
        <div className="sec-header">
          <div className="sec-title">Today's Tasks</div>
          <div className="add-btn" onClick={openTaskModal}>+</div>
        </div>
        {loading ? <div className="loading">Loading...</div> :
          tasks.length === 0 ? <div className="empty">No tasks yet — tap + to add one</div> :
            tasks.map(task => (
              <div key={task.id} className="task-row" onClick={() => toggleTask(task)} onDoubleClick={(e) => { e.stopPropagation(); openEditTask(task, e) }}>
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
        <div style={{ fontSize: 11, color: '#444', marginBottom: 8 }}>Double-click a date to open its timeline</div>
        <div className="cal-grid">{buildCal()}</div>
      </div>
    </>
  )

  // ── TIMELINE VIEW ──────────────────────────────────────────────────────────
  const timelineView = (
    <div className="timeline-view">
      <div className="timeline-left">
        <div className="tl-date-header">
          <div className="tl-date-label">{formatDateLabel(timelineDate)}</div>
          <button className="tl-back-btn" onClick={() => setTimelineDate(todayStr())}>Today</button>
        </div>
        <div className="tl-scroll" ref={tlScrollRef} style={{ overflowY: 'auto', height: 'calc(100% - 48px)', position: 'relative' }}>
          <div style={{ position: 'relative', height: 1440 }}>
            {buildHourRows()}
            {buildTimelineEvents()}
            {isToday && (
              <div className="tl-now-line" style={{ top: nowPos }}>
                <div className="tl-now-dot" />
              </div>
            )}
          </div>
        </div>
        <button className="tl-add-btn" onClick={openMeetingModal}>+</button>
      </div>

      <div className="timeline-right">
        <div className="timeline-right-title">Tasks</div>
        {tasks.length === 0 ? <div style={{ color: '#333', fontSize: 13 }}>No tasks</div> :
          tasks.map(task => (
            <div key={task.id} className="tl-task-item" onClick={() => toggleTask(task)} onDoubleClick={(e) => { e.stopPropagation(); openEditTask(task) }}>
              <div className={`tl-task-cb${task.done ? ' done' : ''}`}><div className="tl-task-ck" /></div>
              <div className={`tl-task-text${task.done ? ' done' : ''}`}>{task.title}</div>
              <div className="tl-task-dot" style={{ background: task.color }} />
            </div>
          ))}
        <div className="add-btn" style={{ margin: '6px auto 0' }} onClick={openTaskModal}>+</div>
      </div>
    </div>
  )

  // ── MEETING MODAL ──────────────────────────────────────────────────────────
  const meetingModal = (
    <div className="overlay" onClick={e => e.target.classList.contains('overlay') && setModal(null)}>
      <div className="modal">
        <div className="modal-title">{modal === 'editMeeting' ? 'Edit Meeting' : 'New Meeting'}</div>

        <label className="field-label">Title</label>
        <input className="field-input" placeholder="e.g. Team standup" value={meetingForm.title}
          onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))} autoFocus />

        <label className="field-label">Time</label>
        <input className="field-input" type="time" value={meetingForm.time}
          onChange={e => setMeetingForm(f => ({ ...f, time: e.target.value }))} />

        <label className="field-label">Duration</label>
        <div className="chip-row">
          {DURATION_OPTIONS.map(o => (
            <button key={o.value} className={`chip${meetingForm.duration === o.value ? ' sel' : ''}`}
              onClick={() => setMeetingForm(f => ({ ...f, duration: o.value }))}>
              {o.label}
            </button>
          ))}
        </div>

        <label className="field-label">Alert</label>
        <div className="chip-row">
          {ALERT_OPTIONS.map(o => (
            <button key={o.value} className={`chip${meetingForm.alert === o.value ? ' sel' : ''}`}
              onClick={() => setMeetingForm(f => ({ ...f, alert: o.value }))}>
              {o.label}
            </button>
          ))}
        </div>

        <label className="field-label">Repeat</label>
        <div className="chip-row">
          {REPEAT_OPTIONS.map(r => (
            <button key={r} className={`chip${meetingForm.repeat === r ? ' sel' : ''}`}
              onClick={() => setMeetingForm(f => ({ ...f, repeat: r }))}>
              {r}
            </button>
          ))}
        </div>

        <label className="field-label">Notes (optional)</label>
        <input className="field-input" placeholder="e.g. Zoom call" value={meetingForm.notes}
          onChange={e => setMeetingForm(f => ({ ...f, notes: e.target.value }))} />

        <label className="field-label">Color</label>
        <div className="color-row">
          {COLORS.map(c => (
            <div key={c} className={`cdot${meetingForm.color === c ? ' sel' : ''}`}
              style={{ background: c }} onClick={() => setMeetingForm(f => ({ ...f, color: c }))} />
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
          {modal === 'editMeeting' && (
            <button className="btn-delete" onClick={deleteMeeting}>Delete</button>
          )}
          <button className="btn-add" onClick={saveMeeting}>{modal === 'editMeeting' ? 'Save' : 'Add'}</button>
        </div>
      </div>
    </div>
  )

  // ── TASK MODAL ─────────────────────────────────────────────────────────────
  const taskModal = (
    <div className="overlay" onClick={e => e.target.classList.contains('overlay') && setModal(null)}>
      <div className="modal">
        <div className="modal-title">{modal === 'editTask' ? 'Edit Task' : 'New Task'}</div>

        <label className="field-label">Title</label>
        <input className="field-input" placeholder="e.g. Reply to emails" value={taskForm.title}
          onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} autoFocus />

        <label className="field-label">Color</label>
        <div className="color-row">
          {COLORS.map(c => (
            <div key={c} className={`cdot${taskForm.color === c ? ' sel' : ''}`}
              style={{ background: c }} onClick={() => setTaskForm(f => ({ ...f, color: c }))} />
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
          {modal === 'editTask' && (
            <button className="btn-delete" onClick={deleteTask}>Delete</button>
          )}
          <button className="btn-add" onClick={saveTask}>{modal === 'editTask' ? 'Save' : 'Add'}</button>
        </div>
      </div>
    </div>
  )

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

        <div className="view-toggle">
          <button className={`vtab${view === 'dashboard' ? ' active' : ''}`} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={`vtab${view === 'timeline' ? ' active' : ''}`} onClick={() => { setTimelineDate(todayStr()); setView('timeline') }}>Timeline</button>
        </div>

        {view === 'dashboard' ? dashboardView : timelineView}
      </div>

      {(modal === 'meeting' || modal === 'editMeeting') && meetingModal}
      {(modal === 'task' || modal === 'editTask') && taskModal}

      {overlapPopup && (
        <div className="overlap-popup" onClick={() => setOverlapPopup(null)}>
          <div className="overlap-popup-inner" onClick={e => e.stopPropagation()}>
            <div className="overlap-popup-title">Overlapping Events</div>
            {overlapPopup.map(ev => (
              <div key={ev.id} className="overlap-popup-item" onDoubleClick={() => { setOverlapPopup(null); openEditMeeting(ev) }}>
                <div className="overlap-popup-bar" style={{ background: ev.color }} />
                <div>
                  <div className="overlap-popup-text">{ev.title}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{formatTime(ev.time)} · {ev.duration || 30}min</div>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: '#444', marginTop: 8 }}>Double-click an event to edit</div>
            <button className="overlap-popup-close" onClick={() => setOverlapPopup(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
