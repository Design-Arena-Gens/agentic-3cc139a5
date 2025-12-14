'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface Task {
  id: string
  title: string
  description: string
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

export default function Home() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        { id: '1', title: 'Design Homepage', description: 'Create wireframes and mockups for the landing page' },
        { id: '2', title: 'Setup Database', description: 'Configure PostgreSQL and set up initial schema' },
      ]
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: [
        { id: '3', title: 'Build API Endpoints', description: 'Implement REST API for user authentication' },
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        { id: '4', title: 'Project Setup', description: 'Initialize Next.js project with TypeScript' },
        { id: '5', title: 'Install Dependencies', description: 'Add all required npm packages' },
      ]
    }
  ])

  const [newTasks, setNewTasks] = useState<{[key: string]: {title: string, description: string}}>({})

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const sourceTasks = [...sourceColumn.tasks]
    const destTasks = source.droppableId === destination.droppableId ? sourceTasks : [...destColumn.tasks]

    const [movedTask] = sourceTasks.splice(source.index, 1)
    destTasks.splice(destination.index, 0, movedTask)

    setColumns(columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: sourceTasks }
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: destTasks }
      }
      return col
    }))
  }

  const addTask = (columnId: string) => {
    const newTask = newTasks[columnId]
    if (!newTask?.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description
    }

    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, task] }
      }
      return col
    }))

    setNewTasks({ ...newTasks, [columnId]: { title: '', description: '' } })
  }

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: col.tasks.filter(task => task.id !== taskId) }
      }
      return col
    }))
  }

  const updateNewTask = (columnId: string, field: 'title' | 'description', value: string) => {
    setNewTasks({
      ...newTasks,
      [columnId]: {
        ...newTasks[columnId],
        [field]: value
      }
    })
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Kanban Board</h1>
        <p>Drag and drop tasks to organize your workflow</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {columns.map(column => (
            <div key={column.id} className="column">
              <div className="column-header">
                <h2 className="column-title">{column.title}</h2>
                <span className="task-count">{column.tasks.length}</span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    className="tasks-list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="task-header">
                              <div className="task-title">{task.title}</div>
                              <button
                                className="delete-btn"
                                onClick={() => deleteTask(column.id, task.id)}
                              >
                                ✕
                              </button>
                            </div>
                            {task.description && (
                              <div className="task-description">{task.description}</div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="add-task-form">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTasks[column.id]?.title || ''}
                    onChange={(e) => updateNewTask(column.id, 'title', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask(column.id)}
                  />
                </div>
                <div className="input-group">
                  <textarea
                    placeholder="Description (optional)..."
                    value={newTasks[column.id]?.description || ''}
                    onChange={(e) => updateNewTask(column.id, 'description', e.target.value)}
                  />
                </div>
                <button
                  className="add-btn"
                  onClick={() => addTask(column.id)}
                  disabled={!newTasks[column.id]?.title?.trim()}
                >
                  + Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
