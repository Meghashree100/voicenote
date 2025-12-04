import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTasks, updateTask } from '../store/taskSlice';
import { useEffect } from 'react';
import TaskCard from './TaskCard';
import type { Task } from '../types/task';

interface KanbanBoardProps {
  onEditTask: (task: Task) => void;
}

const statuses: Array<{ id: string; label: string; color: string; gradient: string; icon: string }> = [
  { 
    id: 'To Do', 
    label: 'To Do', 
    color: 'bg-gray-100',
    gradient: 'from-gray-400 to-gray-500',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  },
  { 
    id: 'In Progress', 
    label: 'In Progress', 
    color: 'bg-blue-100',
    gradient: 'from-blue-400 to-indigo-500',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  { 
    id: 'Done', 
    label: 'Done', 
    color: 'bg-green-100',
    gradient: 'from-green-400 to-emerald-500',
    icon: 'M5 13l4 4L19 7'
  },
];

export default function KanbanBoard({ onEditTask }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const { tasks, loading, filters } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const taskId = draggableId;
    const newStatus = destination.droppableId as Task['status'];

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      await dispatch(updateTask({ id: taskId, updates: { status: newStatus } })).unwrap();
    } catch (error) {
      alert('Failed to update task status');
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((status) => {
          const statusTasks = getTasksByStatus(status.id);
          
          return (
            <div key={status.id} className="flex flex-col">
              <div className={`glass rounded-t-2xl p-4 mb-3 shadow-lg border-b-2 border-white/50`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${status.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={status.icon} />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">{status.label}</h2>
                      <p className="text-xs text-gray-500">{statusTasks.length} tasks</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Droppable droppableId={status.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`
                      flex-1 min-h-[500px] p-4 rounded-b-2xl
                      ${snapshot.isDraggingOver 
                        ? 'bg-gradient-to-b from-purple-50 to-indigo-50 border-2 border-dashed border-purple-300' 
                        : 'bg-white/60 backdrop-blur-sm'
                      }
                      smooth-transition
                    `}
                  >
                    {statusTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-60 rotate-2' : 'smooth-transition'}
                          >
                            <TaskCard task={task} onEdit={onEditTask} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {statusTasks.length === 0 && (
                      <div className="text-center text-gray-400 py-12">
                        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm">No tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

