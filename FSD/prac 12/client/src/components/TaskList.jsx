import TaskItem from './TaskItem.jsx'

export default function TaskList({ tasks, loading, editingId, onToggle, onEdit, onDelete }) {
  if (loading) {
    return <p className="state">Loading tasks...</p>
  }

  if (tasks.length === 0) {
    return <p className="state">No tasks to show.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={editingId === task.id}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
