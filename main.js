// State
const state = {
  user: null,
  issues: [],
  filter: 'all', // 'all', 'open', 'closed'
  searchQuery: '',
  loading: false,
};

// DOM Elements
const app = document.getElementById('app');

// Icons map for easy usage
const getIcon = (name, attrs = {}) => {
  // We will render icons after DOM updates using lucide.createIcons
  return `<i data-lucide="${name}" class="${attrs.class || ''}"></i>`;
};

// Label Styling Helpers
const getLabelStyle = label => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('bug'))
    return 'bg-red-50 text-red-500 border-red-100';
  if (lowerLabel.includes('help'))
    return 'bg-yellow-50 text-yellow-600 border-yellow-100';
  if (lowerLabel.includes('enhancement'))
    return 'bg-green-50 text-green-600 border-green-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

const getLabelIcon = label => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('bug')) return 'bug';
  if (lowerLabel.includes('help')) return 'life-buoy';
  if (lowerLabel.includes('enhancement')) return 'sparkles';
  return 'tag';
};

// --- Views ---

function renderLogin() {
  app.innerHTML = `
    <div class="min-h-screen bg-[#F4F7FE] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div class="bg-white py-12 px-10 shadow-xl rounded-2xl">
          
          <!-- Logo & Header -->
          <div class="text-center mb-10">
            <div class="mx-auto h-20 w-20 flex items-center justify-center mb-6">
                <img src="assets/githubLogo.png" alt="GitHub Logo" class="w-full h-full object-contain">
            </div>
            <h2 class="text-2xl font-bold text-[#1B254B] mb-2">GitHub Issues Tracker</h2>
            <p class="text-sm text-gray-500 font-medium">
              Sign in to manage your issues
            </p>
          </div>

          <form id="login-form" class="space-y-6">
            <div id="login-error" class="hidden bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div class="flex">
                  <div class="ml-3">
                    <p class="text-sm text-red-700">Invalid credentials. Please try again.</p>
                  </div>
                </div>
            </div>

            <div>
              <label htmlFor="username" class="block text-sm font-medium text-[#1B254B] mb-2">
                Username
              </label>
              <div class="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4318FF] focus:border-transparent sm:text-sm transition-all"
                  placeholder="Enter Username"
                />
              </div>
              <p class="mt-2 text-xs font-medium text-[#4318FF]">Default: admin</p>
            </div>

            <div>
              <label htmlFor="password" class="block text-sm font-medium text-[#1B254B] mb-2">
                Password
              </label>
              <div class="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  class="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4318FF] focus:border-transparent sm:text-sm transition-all"
                  placeholder="Enter Password"
                />
              </div>
              <p class="mt-2 text-xs font-medium text-[#4318FF]">Default: admin123</p>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#4318FF] hover:bg-[#3311CC] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4318FF] transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

          

            <div class="mt-8 text-center">
                <p class="text-xs text-gray-400 mb-4 font-medium">Demo Credentials:</p>
                <div class="bg-[#F4F7FE] py-4 px-4 rounded-xl">
                    <p class="text-sm font-medium text-[#1B254B] mb-1">Username: <span class="font-normal">admin</span></p>
                    <p class="text-sm font-medium text-[#1B254B]">Password: <span class="font-normal">admin123</span></p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons();

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (username === 'admin' && password === 'admin123') {
      state.user = { username };
      renderDashboard();
    } else {
      document.getElementById('login-error').classList.remove('hidden');
    }
  });
}

function renderDashboard() {
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <img src="assets/githubLogo.png" alt="GitHub Logo" class="w-8 h-8">
            <span class="font-semibold text-xl tracking-tight text-gray-900">GitHub Issues Tracker</span>
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto">
            <form id="search-form" class="relative w-full md:w-80">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-lucide="search" class="h-4 w-4 text-gray-500"></i>
              </div>
              <input
                type="text"
                id="search-input"
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search issues..."
                value="${state.searchQuery}"
              />
            </form>
            <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors">
              <i data-lucide="plus" class="w-4 h-4"></i>
              New Issue
            </button>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Tab Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div class="border-b border-gray-200 bg-gray-50/50">
            <nav class="flex -mb-px px-4" aria-label="Tabs" id="tabs-container">
              <!-- Tabs injected here -->
            </nav>
          </div>

          <div class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <img src="assets/aperture.png" alt="All Issues" class="w-6 h-6">
              </div>
              <div>
                <h2 class="text-lg font-bold text-gray-900" id="total-count">
                  0 Issues
                </h2>
                <p class="text-sm text-gray-500">
                  Track and manage your project issues
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm font-medium">
              <div class="flex items-center gap-1.5 text-gray-700">
                <img src="assets/openStatus.png" alt="Open" class="w-4 h-4">
                <span id="open-count">0 Open</span>
              </div>
              <div class="flex items-center gap-1.5 text-gray-700">
                <img src="assets/closeStatus.png" alt="Closed" class="w-4 h-4">
                <span id="closed-count">0 Closed</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Issues Grid -->
        <div id="issues-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <!-- Content injected here -->
        </div>
        
        <!-- Loading Spinner -->
        <div id="loading-spinner" class="hidden flex justify-center items-center h-64">
             <i data-lucide="loader-2" class="w-12 h-12 text-blue-600 animate-spin"></i>
        </div>

      </main>
    </div>
    
    <!-- Modal Container -->
    <div id="modal-container"></div>
  `;

  lucide.createIcons();

  // Event Listeners
  document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    const query = document.getElementById('search-input').value;
    state.searchQuery = query;
    fetchIssues(query);
  });

  fetchIssues(state.searchQuery);
}

async function fetchIssues(query = '') {
  const grid = document.getElementById('issues-grid');
  const spinner = document.getElementById('loading-spinner');

  // Show spinner, hide grid
  if (spinner) spinner.classList.remove('hidden');
  if (grid) grid.classList.add('hidden');

  state.loading = true;

  try {
    const url = query
      ? `https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`
      : 'https://phi-lab-server.vercel.app/api/v1/lab/issues';

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'success' && Array.isArray(data.data)) {
      state.issues = data.data;
    } else {
      state.issues = [];
      console.error('Unexpected API response format:', data);
    }
  } catch (error) {
    console.error('Error fetching issues:', error);
    state.issues = [];
  } finally {
    state.loading = false;
    if (spinner) spinner.classList.add('hidden');
    if (grid) grid.classList.remove('hidden');
    renderIssues();
    renderTabs();
    updateCounts();
  }
}

function renderTabs() {
  const container = document.getElementById('tabs-container');
  if (!container) return;

  const tabs = ['all', 'open', 'closed'];

  container.innerHTML = tabs
    .map(tab => {
      const isActive = state.filter === tab;
      const activeClass = 'border-blue-500 text-blue-600 bg-white rounded-t-lg';
      const inactiveClass =
        'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

      return `
      <button
        data-tab="${tab}"
        class="whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm capitalize transition-colors ${isActive ? activeClass : inactiveClass}"
      >
        ${tab}
      </button>
    `;
    })
    .join('');

  // Add click handlers
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.tab;
      renderTabs();
      renderIssues();
      updateCounts();
    });
  });
}

function updateCounts() {
  const filtered = getFilteredIssues();
  const openCount = state.issues.filter(i => i.status === 'open').length;
  const closedCount = state.issues.filter(i => i.status === 'closed').length;

  const totalEl = document.getElementById('total-count');
  const openEl = document.getElementById('open-count');
  const closedEl = document.getElementById('closed-count');

  if (totalEl) totalEl.textContent = `${filtered.length} Issues`;
  if (openEl) openEl.textContent = `${openCount} Open`;
  if (closedEl) closedEl.textContent = `${closedCount} Closed`;
}

function getFilteredIssues() {
  return state.issues.filter(issue => {
    if (state.filter === 'all') return true;
    return issue.status === state.filter;
  });
}

function renderIssues() {
  const grid = document.getElementById('issues-grid');
  if (!grid) return;

  const filteredIssues = getFilteredIssues();

  if (filteredIssues.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
        <div class="mx-auto h-12 w-12 text-gray-400 mb-3 flex justify-center items-center">
           <i data-lucide="circle-dot" class="w-12 h-12"></i>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
        <p class="mt-1 text-sm text-gray-500">
          ${state.searchQuery ? `No issues matching "${state.searchQuery}"` : `No ${state.filter} issues available.`}
        </p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filteredIssues
    .map(issue => {
      const isOpen = issue.status === 'open';
      const date = new Date(issue.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });

      // Priority Styling
      let priorityClass = 'bg-gray-100 text-gray-600';
      if (issue.priority === 'high') priorityClass = 'bg-red-50 text-red-500';
      else if (issue.priority === 'medium')
        priorityClass = 'bg-yellow-50 text-yellow-600';
      else if (issue.priority === 'low')
        priorityClass = 'bg-gray-100 text-gray-500';

      const labelsHtml =
        issue.labels.length > 0
          ? issue.labels
              .map(
                l => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getLabelStyle(l)}">
                <i data-lucide="${getLabelIcon(l)}" class="w-3.5 h-3.5"></i>
                ${l}
            </span>`,
              )
              .join('')
          : `<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">No Labels</span>`;

      return `
      <div 
        onclick="window.openModal(${issue.id})"
        class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer flex flex-col h-full overflow-hidden relative group"
      >
        <!-- Top Border -->
        <div class="h-1.5 w-full ${isOpen ? 'bg-emerald-500' : 'bg-purple-600'}"></div>
        
        <div class="p-5 flex flex-col flex-grow">
          <!-- Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="inline-flex items-center justify-center w-8 h-8 rounded-full ${isOpen ? 'bg-emerald-100' : 'bg-purple-100'}">
              <img src="${isOpen ? 'assets/openStatus.png' : 'assets/closeStatus.png'}" class="w-5 h-5" alt="${issue.status}">
            </div>
            <span class="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${priorityClass}">
              ${issue.priority}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
            ${issue.title}
          </h3>
          
          <!-- Description -->
          <p class="text-slate-500 text-sm mb-5 line-clamp-3 leading-relaxed">
            ${issue.description}
          </p>

          <!-- Labels -->
          <div class="flex flex-wrap gap-2 mb-6">
            ${labelsHtml}
          </div>

          <!-- Footer -->
          <div class="mt-auto pt-4 border-t border-gray-100">
            <div class="text-sm font-medium text-slate-600 mb-1">
              #${issue.id} by ${issue.author}
            </div>
            <div class="text-sm text-slate-500">
              ${date}
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');

  lucide.createIcons();
}

window.openModal = id => {
  const issue = state.issues.find(i => i.id === id);
  if (!issue) return;

  const isOpen = issue.status === 'open';
  const date = new Date(issue.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const labelsHtml =
    issue.labels.length > 0
      ? issue.labels
          .map(
            l => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getLabelStyle(l)}">
                <i data-lucide="${getLabelIcon(l)}" class="w-3.5 h-3.5"></i>
                ${l}
            </span>
        `,
          )
          .join('')
      : ``;

  let priorityBadgeClass = 'bg-gray-100 text-gray-600';
  if (issue.priority === 'high') priorityBadgeClass = 'bg-red-500 text-white';
  else if (issue.priority === 'medium')
    priorityBadgeClass = 'bg-yellow-500 text-white';
  else if (issue.priority === 'low')
    priorityBadgeClass = 'bg-gray-500 text-white';

  const modalHtml = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" id="modal-overlay">
        <div 
          class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          onclick="window.closeModal()"
        ></div>
        
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200 p-8">
          
          <!-- Header Section -->
          <div class="mb-6">
            <h2 class="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              ${issue.title}
            </h2>
            
            <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span class="px-3 py-1 rounded-full text-sm font-medium text-white ${isOpen ? 'bg-emerald-500' : 'bg-purple-600'}">
                ${isOpen ? 'Opened' : 'Closed'}
              </span>
              <span>•</span>
              <span>Opened by <span class="text-gray-700">${issue.author}</span></span>
              <span>•</span>
              <span>${date}</span>
            </div>
          </div>

          <!-- Labels -->
          <div class="flex flex-wrap gap-2 mb-6">
            ${labelsHtml}
          </div>

          <!-- Description -->
          <div class="mb-8">
             <p class="text-slate-500 text-lg leading-relaxed whitespace-pre-wrap">${issue.description}</p>
          </div>

          <!-- Details Box -->
          <div class="bg-slate-50 rounded-xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
            <div>
              <div class="text-slate-500 text-lg mb-1">Assignee:</div>
              <div class="text-gray-900 font-bold text-xl">${issue.author}</div>
            </div>
            <div>
              <div class="text-slate-500 text-lg mb-1">Priority:</div>
              <span class="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block ${priorityBadgeClass}">
                ${issue.priority}
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end">
            <button 
              onclick="window.closeModal()"
              class="px-10 py-3 bg-[#4F46E5] hover:bg-[#4338ca] rounded-lg text-lg font-bold text-white transition-colors shadow-lg shadow-indigo-500/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    `;

  document.getElementById('modal-container').innerHTML = modalHtml;
  lucide.createIcons();

  // Close on Escape
  document.addEventListener('keydown', function handleEsc(e) {
    if (e.key === 'Escape') {
      window.closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  });
};

window.closeModal = () => {
  document.getElementById('modal-container').innerHTML = '';
};

// Initialize
renderLogin();
