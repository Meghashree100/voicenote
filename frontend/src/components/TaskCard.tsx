import { useState } from 'react';
import { format } from 'date-fns';
import { useAppDispatch } from '../hooks/redux';
import { deleteTask } from '../store/taskSlice';
import type { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const priorityColors = {
    Low: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
    Medium: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300',
    High: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-300',
    Critical: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-300 animate-pulse',
  };

  const priorityBorders = {
    Low: 'border-l-green-500',
    Medium: 'border-l-yellow-500',
    High: 'border-l-orange-500',
    Critical: 'border-l-red-500',
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await dispatch(deleteTask(task.id)).unwrap();
    } catch (error) {
      alert('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      if (diffDays === -1) return 'Yesterday';
      if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
      
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`glass rounded-xl shadow-lg p-5 mb-3 border-l-4 ${priorityBorders[task.priority]} hover-lift smooth-transition group`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800 flex-1 text-lg group-hover:text-purple-600 smooth-transition">{task.title}</h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg smooth-transition"
            title="Edit task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg smooth-transition disabled:opacity-50"
            title="Delete task"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 shadow-sm ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        
        {task.dueDate && (
          <div className="flex items-center gap-1.5">
            <svg className={`w-4 h-4 ${
              new Date(task.dueDate) < new Date() ? 'text-red-500' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`text-xs font-medium ${
              new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-600'
            }`}>
              {formatDueDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

