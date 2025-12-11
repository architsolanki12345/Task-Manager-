import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import dayjs from 'dayjs';
import { load, save } from './utils/storage';
import { nextId } from './utils/id';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Low', status: 'To-Do', dueDate: '' });
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    const data = load();
    if (data.length === 0) {
      fetch('/tasks.json')
        .then(res => res.json())
        .then(data => setTasks(data))
        .catch(() => setTasks([]));
    } else {
      setTasks(data);
    }
  }, []);

  useEffect(() => save(tasks), [tasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'Low', status: 'To-Do', dueDate: '' });
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({ ...task });
    setShowModal(true);
  };

  const handleSaveTask = () => {
    if (!taskForm.title.trim()) return;
    const now = dayjs().format();
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...taskForm, id: editingTask.id, createdAt: editingTask.createdAt } : t));
    } else {
      const newTask = { ...taskForm, id: nextId(tasks), createdAt: now };
      setTasks([...tasks, newTask]);
    }
    setShowModal(false);
  };

  const handleDeleteTask = (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;
    const taskId = result.draggableId;
    const newStatus = destination.droppableId;
    setTasks(tasks.map(t => t.id == taskId ? { ...t, status: newStatus } : t));
  };

  const filteredTasks = tasks.filter(t =>
    (!filterPriority || t.priority === filterPriority) &&
    (!filterStatus || t.status === filterStatus)
  ).sort((a, b) => {
    if (sortBy === 'createdAt') return dayjs(a.createdAt).isBefore(dayjs(b.createdAt)) ? -1 : 1;
    if (sortBy === 'dueDate') return dayjs(a.dueDate).isBefore(dayjs(b.dueDate)) ? -1 : 1;
    return 0;
  });

  const tasksByStatus = {
    'To-Do': filteredTasks.filter(t => t.status === 'To-Do'),
    'In-Progress': filteredTasks.filter(t => t.status === 'In-Progress'),
    'Completed': filteredTasks.filter(t => t.status === 'Completed')
  };

  const getDuplicateCount = (title, status) => {
    return tasksByStatus[status].filter(t => t.title === title).length;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-4 py-2 rounded">Add Task</button>
      </header>
      <div className="mb-4 flex flex-wrap gap-4">
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border p-2">
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border p-2">
          <option value="">All Statuses</option>
          <option value="To-Do">To-Do</option>
          <option value="In-Progress">In-Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border p-2">
          <option value="createdAt">Oldest First</option>
          <option value="dueDate">Closest Due Date</option>
        </select>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tasksByStatus).map(([status, tasks]) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="bg-white p-4 rounded shadow">
                  <h2 className="text-xl font-semibold mb-4">{status}</h2>
                  {tasks.map((task, index) => {
                    const dupCount = getDuplicateCount(task.title, status);
                    return (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-50 p-3 mb-2 rounded cursor-pointer"
                            onClick={() => handleEditTask(task)}
                          >
                            <h3 className="font-bold">{task.title} {dupCount > 1 ? `(${dupCount})` : ''}</h3>
                            <p>{task.description}</p>
                            <p>Priority: {task.priority}</p>
                            <p>Due: {dayjs(task.dueDate).format('MMM D, YYYY')}</p>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="text-red-500 mt-2">Delete</button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
            <input
              type="text"
              placeholder="Title"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <textarea
              placeholder="Description"
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <select
              value={taskForm.priority}
              onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
              className="w-full mb-2 p-2 border"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full mb-2 p-2 border"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2">Cancel</button>
              <button onClick={handleSaveTask} className="bg-blue-500 text-white px-4 py-2">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
