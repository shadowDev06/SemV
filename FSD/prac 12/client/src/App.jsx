import { useCallback, useEffect, useState } from 'react'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import { createTask, deleteTask, getTasks, updateTask } from './api/tasks.js'
import './App.css'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function App() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadTasks = useCallback(async () => {
    setLoading(true)

    try {
      const payload = await getTasks({ status: filter, search })
      setTasks(payload.data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    if (!notice) {
      return undefined
    }

    const timer = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  async function handleCreate(data) {
    try {
      await createTask(data)
      setNotice('Task added.')
      await loadTasks()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function handleUpdate(id, changes) {
    try {
      await updateTask(id, changes)
      setEditing(null)
      setNotice('Task updated.')
      await loadTasks()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  async function handleToggle(task) {
    try {
      await updateTask(task.id, { completed: !task.completed })
      await loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) {
      return
    }

    try {
      await deleteTask(task.id)
      if (editing && editing.id === task.id) {
        setEditing(null)
      }
      setNotice('Task deleted.')
      await loadTasks()
    } catch (err) {
      setError(err.message)
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Task Board</h1>
          <p>A React client consuming an Express.js REST API</p>
        </div>
        <span className="api-tag">REST /api/tasks</span>
      </header>

      <main>
        {error && (
          <p className="banner error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="banner success" role="status">
            {notice}
          </p>
        )}

        <div className="layout">
          <section className="panel">
            <h2>{editing ? `Edit task #${editing.id}` : 'New task'}</h2>
            <TaskForm
              editing={editing}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          </section>

          <section className="panel">
            <div className="panel-heading">
              <h2>Tasks</h2>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search tasks"
                aria-label="Search tasks"
              />
            </div>

            <div className="filters" role="group" aria-label="Filter tasks">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={filter === item.value ? 'active' : ''}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <p className="summary">
              {tasks.length} shown &middot; {completedCount} completed
            </p>

            <TaskList
              tasks={tasks}
              loading={loading}
              editingId={editing?.id}
              onToggle={handleToggle}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          </section>
        </div>
      </main>

      <footer>Practical 12 &mdash; Express.js REST API + React</footer>
    </div>
  )
}
