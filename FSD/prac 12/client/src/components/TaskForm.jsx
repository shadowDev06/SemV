import { useEffect, useState } from 'react'

const EMPTY_FORM = { title: '', description: '', priority: 'medium' }

export default function TaskForm({ editing, onCreate, onUpdate, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    setForm(
      editing
        ? {
            title: editing.title,
            description: editing.description,
            priority: editing.priority,
          }
        : EMPTY_FORM,
    )
    setValidationError('')
  }, [editing])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (form.title.trim().length < 3) {
      setValidationError('Title must be at least 3 characters long.')
      return
    }

    setValidationError('')

    try {
      if (editing) {
        await onUpdate(editing.id, form)
      } else {
        await onCreate(form)
        setForm(EMPTY_FORM)
      }
    } catch {
      // The parent component shows the API error in its banner.
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label htmlFor="task-title">Title</label>
      <input
        id="task-title"
        name="title"
        value={form.title}
        onChange={handleChange}
        maxLength={100}
        placeholder="What needs to be done?"
        required
      />

      <label htmlFor="task-description">Description</label>
      <textarea
        id="task-description"
        name="description"
        value={form.description}
        onChange={handleChange}
        maxLength={500}
        rows={3}
        placeholder="Optional details"
      />

      <label htmlFor="task-priority">Priority</label>
      <select
        id="task-priority"
        name="priority"
        value={form.priority}
        onChange={handleChange}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      {validationError && (
        <p className="form-error" role="alert">
          {validationError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit">{editing ? 'Save changes' : 'Add task'}</button>
        {editing && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
