export default function TaskItem({ task, isEditing, onToggle, onEdit, onDelete }) {
  const classes = ['task']
  if (task.completed) classes.push('done')
  if (isEditing) classes.push('editing')

  return (
    <li className={classes.join(' ')}>
      <input
        type="checkbox"
        className="toggle"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={
          task.completed
            ? `Mark ${task.title} as active`
            : `Mark ${task.title} as completed`
        }
      />

      <div className="task-body">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          <span>#{task.id}</span>
          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="task-actions">
        <button type="button" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="danger" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </li>
  )
}
