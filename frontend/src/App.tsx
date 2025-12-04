import { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import VoiceInput from './components/VoiceInput';
import type { Task, ParsedVoiceInput } from './types/task';

function AppContent() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parsedVoiceInput, setParsedVoiceInput] = useState<ParsedVoiceInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTask = () => {
    setEditingTask(null);
    setParsedVoiceInput(null);
    setShowTaskForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setParsedVoiceInput(null);
    setShowTaskForm(true);
  };

  const handleVoiceParsed = (parsed: ParsedVoiceInput) => {
    setParsedVoiceInput(parsed);
    setShowVoiceInput(false);
    setShowTaskForm(true);
  };

  const handleVoiceError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleTaskFormSuccess = () => {
    setEditingTask(null);
    setParsedVoiceInput(null);
    setShowTaskForm(false);
  };

  return (
    <div className="min-h-screen">
      <header className="glass shadow-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold gradient-text">VoiceNote</h1>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => setShowVoiceInput(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 smooth-transition flex items-center gap-2 shadow-lg hover-lift font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Voice Input
              </button>
              <button
                onClick={handleCreateTask}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 smooth-transition flex items-center gap-2 shadow-lg hover-lift font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md animate-slide-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-5 py-2.5 rounded-lg smooth-transition flex items-center gap-2 font-medium ${
                viewMode === 'kanban'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-5 py-2.5 rounded-lg smooth-transition flex items-center gap-2 font-medium ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
        </div>

        <FilterBar />

        {viewMode === 'kanban' ? (
          <KanbanBoard onEditTask={handleEditTask} />
        ) : (
          <TaskList onEditTask={handleEditTask} />
        )}

        {showTaskForm && (
          <TaskForm
            task={editingTask}
            parsedVoiceInput={parsedVoiceInput}
            onClose={() => {
              setShowTaskForm(false);
              setEditingTask(null);
              setParsedVoiceInput(null);
            }}
            onSuccess={handleTaskFormSuccess}
          />
        )}

        {showVoiceInput && (
          <div className="fixed inset-0 glass-dark flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass rounded-2xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text">Voice Input</h2>
                <button
                  onClick={() => setShowVoiceInput(false)}
                  className="text-gray-500 hover:text-gray-700 smooth-transition p-1 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <VoiceInput
                onParsed={handleVoiceParsed}
                onError={handleVoiceError}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
