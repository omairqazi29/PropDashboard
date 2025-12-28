// Prop Trading Dashboard - Main Application

// Initial State
const state = {
    accounts: {
        apex: [
            { id: 1, name: 'Apex 50K #1', status: 'passed', passedDate: '2024-12-20' },
            { id: 2, name: 'Apex 50K #2', status: 'passed', passedDate: '2024-12-22' },
            { id: 3, name: 'Apex 50K #3', status: 'passed', passedDate: '2024-12-25' }
        ],
        lucid: [
            { id: 1, name: 'Lucid Flex 50K #1', status: 'passed', passedDate: '2024-12-24' }
        ]
    },
    dailyLog: [],
    stats: {
        totalEvalsBought: 0,
        totalPassed: 4,
        totalFailed: 0,
        monthlySpent: 0
    },
    costs: {
        apexEval: 20,
        lucidEval: 80
    }
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('propDashboard');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
    }
    render();
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('propDashboard', JSON.stringify(state));
}

// Generate daily tasks based on goals
function generateDailyTasks() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const tasks = [
        {
            id: 1,
            text: `Buy 1 Apex Eval (~$${state.costs.apexEval}) - Use the discount!`,
            priority: 'high',
            completed: false
        },
        {
            id: 2,
            text: `Buy 1 Lucid Flex Eval (~$${state.costs.lucidEval})`,
            priority: 'high',
            completed: false
        },
        {
            id: 3,
            text: 'Execute full position at market open',
            priority: 'high',
            completed: false
        },
        {
            id: 4,
            text: 'Pass at least 1 evaluation account',
            priority: 'high',
            completed: false
        },
        {
            id: 5,
            text: 'Review trades and log results',
            priority: 'medium',
            completed: false
        }
    ];

    return tasks;
}

// Render daily tasks
function renderDailyTasks() {
    const container = document.getElementById('daily-tasks');
    const tasks = generateDailyTasks();

    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <span>${task.text}</span>
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
        </div>
    `).join('');
}

// Render accounts
function renderAccounts() {
    const apexContainer = document.getElementById('apex-accounts');
    const lucidContainer = document.getElementById('lucid-accounts');

    apexContainer.innerHTML = state.accounts.apex.map(acc => `
        <div class="account-item">
            <span>${acc.name}</span>
            <span class="status ${acc.status}">${acc.status}</span>
        </div>
    `).join('');

    lucidContainer.innerHTML = state.accounts.lucid.map(acc => `
        <div class="account-item">
            <span>${acc.name}</span>
            <span class="status ${acc.status}">${acc.status}</span>
        </div>
    `).join('');

    document.getElementById('apex-passed').textContent = state.accounts.apex.filter(a => a.status === 'passed').length;
    document.getElementById('lucid-passed').textContent = state.accounts.lucid.filter(a => a.status === 'passed').length;
}

// Render statistics
function renderStats() {
    const totalPassed = state.accounts.apex.filter(a => a.status === 'passed').length +
                        state.accounts.lucid.filter(a => a.status === 'passed').length;

    document.getElementById('total-passed').textContent = totalPassed;
    document.getElementById('monthly-investment').textContent = `$${state.stats.monthlySpent}`;

    // Estimate potential payouts (rough estimate: $2000 per passed account first payout)
    const potentialPayouts = totalPassed * 2000;
    document.getElementById('potential-payouts').textContent = `$${potentialPayouts.toLocaleString()}`;

    // Calculate pass rate
    const totalAttempts = state.stats.totalEvalsBought || totalPassed;
    const passRate = totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0;
    document.getElementById('pass-rate').textContent = `${passRate}%`;
}

// Render daily log
function renderDailyLog() {
    const container = document.getElementById('daily-log');

    if (state.dailyLog.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No entries yet. Save your first day\'s progress!</p>';
        return;
    }

    container.innerHTML = state.dailyLog.slice().reverse().map(entry => `
        <div class="log-entry">
            <div class="date">${entry.date}</div>
            <div class="details">
                ${entry.boughtApex ? '✅ Bought Apex Eval' : '❌ No Apex Eval'} |
                ${entry.boughtLucid ? '✅ Bought Lucid Eval' : '❌ No Lucid Eval'} |
                ${entry.tradedOpen ? '✅ Traded Open' : '❌ Missed Open'} |
                Passed: ${entry.accountsPassed}
            </div>
        </div>
    `).join('');
}

// Add new account
function addAccount(type) {
    const accounts = state.accounts[type];
    const newId = accounts.length + 1;
    const name = type === 'apex' ? `Apex 50K #${newId}` : `Lucid Flex 50K #${newId}`;

    accounts.push({
        id: newId,
        name: name,
        status: 'in-progress',
        passedDate: null
    });

    saveState();
    render();
}

// Toggle task completion
function toggleTask(taskId) {
    // Tasks are generated fresh, so we just re-render
    renderDailyTasks();
}

// Save today's progress
function saveDay() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const entry = {
        date: today,
        boughtApex: document.getElementById('bought-apex-eval').checked,
        boughtLucid: document.getElementById('bought-lucid-eval').checked,
        tradedOpen: document.getElementById('traded-open').checked,
        accountsPassed: parseInt(document.getElementById('accounts-passed-today').value) || 0
    };

    // Update stats
    if (entry.boughtApex) {
        state.stats.monthlySpent += state.costs.apexEval;
        state.stats.totalEvalsBought++;
    }
    if (entry.boughtLucid) {
        state.stats.monthlySpent += state.costs.lucidEval;
        state.stats.totalEvalsBought++;
    }

    // Add to log
    state.dailyLog.push(entry);

    // Reset checkboxes
    document.getElementById('bought-apex-eval').checked = false;
    document.getElementById('bought-lucid-eval').checked = false;
    document.getElementById('traded-open').checked = false;
    document.getElementById('accounts-passed-today').value = 0;

    saveState();
    render();

    alert('Day saved! Keep grinding! 💪');
}

// Main render function
function render() {
    renderDailyTasks();
    renderAccounts();
    renderStats();
    renderDailyLog();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadState);
