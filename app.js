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
    expenses: [
        // Initial expenses for passed accounts
        { id: 1, type: 'apex', amount: 25, note: 'Apex 50K #1 eval', date: '2024-12-20T10:00:00.000Z' },
        { id: 2, type: 'apex-activation', amount: 65, note: 'Apex 50K #1 activation', date: '2024-12-20T10:00:00.000Z' },
        { id: 3, type: 'apex', amount: 25, note: 'Apex 50K #2 eval', date: '2024-12-22T10:00:00.000Z' },
        { id: 4, type: 'apex-activation', amount: 65, note: 'Apex 50K #2 activation', date: '2024-12-22T10:00:00.000Z' },
        { id: 5, type: 'apex', amount: 25, note: 'Apex 50K #3 eval', date: '2024-12-25T10:00:00.000Z' },
        { id: 6, type: 'apex-activation', amount: 65, note: 'Apex 50K #3 activation', date: '2024-12-25T10:00:00.000Z' },
        { id: 7, type: 'lucid', amount: 80, note: 'Lucid Flex 50K #1 eval', date: '2024-12-24T10:00:00.000Z' }
    ],
    dailyLog: [],
    stats: {
        totalEvalsBought: 0,
        totalPassed: 4,
        totalFailed: 0,
        monthlySpent: 0
    },
    costs: {
        apexEval: 25,
        apexActivation: 65,
        lucidEval: 80,
        payoutEstimate: 2000
    }
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('propDashboard');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(state, parsed);
        // Ensure expenses array exists for older saves
        if (!state.expenses) state.expenses = [];
        // Ensure new cost fields exist
        if (!state.costs.apexActivation) state.costs.apexActivation = 65;
        if (!state.costs.payoutEstimate) state.costs.payoutEstimate = 2000;
    }
    renderSettings();
    render();
}

// Render settings inputs
function renderSettings() {
    document.getElementById('cost-apex-eval').value = state.costs.apexEval;
    document.getElementById('cost-apex-activation').value = state.costs.apexActivation;
    document.getElementById('cost-lucid-eval').value = state.costs.lucidEval;
    document.getElementById('cost-payout-estimate').value = state.costs.payoutEstimate;
}

// Update cost setting
function updateCost(key, value) {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
        state.costs[key] = num;
        saveState();
        render();
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('propDashboard', JSON.stringify(state));
}

// Generate daily tasks based on goals
function generateDailyTasks() {
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

// Calculate money stats
function calculateMoneyStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalSpent = 0;
    let apexSpent = 0;
    let lucidSpent = 0;
    let apexCount = 0;
    let lucidCount = 0;
    let activationSpent = 0;
    let activationCount = 0;
    let monthlySpent = 0;

    state.expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        totalSpent += expense.amount;

        if (expense.type === 'apex') {
            apexSpent += expense.amount;
            apexCount++;
        } else if (expense.type === 'apex-activation') {
            activationSpent += expense.amount;
            activationCount++;
        } else if (expense.type === 'lucid') {
            lucidSpent += expense.amount;
            lucidCount++;
        }

        // Check if expense is from current month
        if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
            monthlySpent += expense.amount;
        }
    });

    return { totalSpent, apexSpent, lucidSpent, apexCount, lucidCount, activationSpent, activationCount, monthlySpent };
}

// Render money tracker
function renderMoneyTracker() {
    const stats = calculateMoneyStats();

    document.getElementById('total-spent').textContent = `$${stats.totalSpent.toFixed(2)}`;
    document.getElementById('apex-spent').textContent = `$${stats.apexSpent.toFixed(2)}`;
    document.getElementById('apex-eval-count').textContent = `${stats.apexCount} evals`;
    document.getElementById('activation-spent').textContent = `$${stats.activationSpent.toFixed(2)}`;
    document.getElementById('activation-count').textContent = `${stats.activationCount} accounts`;
    document.getElementById('lucid-spent').textContent = `$${stats.lucidSpent.toFixed(2)}`;
    document.getElementById('lucid-eval-count').textContent = `${stats.lucidCount} evals`;

    // Calculate potential ROI
    const totalPassed = state.accounts.apex.filter(a => a.status === 'passed').length +
                        state.accounts.lucid.filter(a => a.status === 'passed').length;
    const potentialPayouts = totalPassed * state.costs.payoutEstimate;
    const roi = stats.totalSpent > 0 ? ((potentialPayouts - stats.totalSpent) / stats.totalSpent * 100) : 0;
    document.getElementById('potential-roi').textContent = `${roi.toFixed(0)}%`;

    // Render expense list
    renderExpenseList();
}

// Render expense list
function renderExpenseList() {
    const container = document.getElementById('expense-list');

    if (state.expenses.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">No expenses recorded yet</p>';
        return;
    }

    // Show last 10 expenses, newest first
    const recentExpenses = state.expenses.slice(-10).reverse();

    container.innerHTML = recentExpenses.map((expense, idx) => {
        const realIndex = state.expenses.length - 1 - idx;
        const typeLabel = expense.type === 'apex' ? 'Apex Eval' :
                         expense.type === 'apex-activation' ? 'Apex Activation' :
                         expense.type === 'lucid' ? 'Lucid Flex' : 'Other';
        const date = new Date(expense.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <div class="expense-item">
                <div class="expense-info">
                    <span class="expense-type">${typeLabel}</span>
                    <span class="expense-date">${date}</span>
                    ${expense.note ? `<span class="expense-note">${expense.note}</span>` : ''}
                </div>
                <span class="expense-amount">-$${expense.amount.toFixed(2)}</span>
                <button class="delete-btn" onclick="deleteExpense(${realIndex})">×</button>
            </div>
        `;
    }).join('');
}

// Add expense
function addExpense() {
    const typeSelect = document.getElementById('expense-type');
    const amountInput = document.getElementById('expense-amount');
    const noteInput = document.getElementById('expense-note');

    const type = typeSelect.value;
    let amount = parseFloat(amountInput.value);

    // Auto-fill amount based on type if not specified
    if (!amount || isNaN(amount)) {
        if (type === 'apex') amount = state.costs.apexEval;
        else if (type === 'apex-activation') amount = state.costs.apexActivation;
        else if (type === 'lucid') amount = state.costs.lucidEval;
        else {
            alert('Please enter an amount for "Other" expenses');
            return;
        }
    }

    const expense = {
        id: Date.now(),
        type: type,
        amount: amount,
        note: noteInput.value.trim(),
        date: new Date().toISOString()
    };

    state.expenses.push(expense);
    state.stats.totalEvalsBought++;

    // Clear form
    amountInput.value = '';
    noteInput.value = '';
    typeSelect.value = 'apex';

    saveState();
    render();
}

// Delete expense
function deleteExpense(index) {
    if (confirm('Delete this expense?')) {
        state.expenses.splice(index, 1);
        saveState();
        render();
    }
}

// Render statistics
function renderStats() {
    const totalPassed = state.accounts.apex.filter(a => a.status === 'passed').length +
                        state.accounts.lucid.filter(a => a.status === 'passed').length;

    const moneyStats = calculateMoneyStats();

    document.getElementById('total-passed').textContent = totalPassed;
    document.getElementById('monthly-investment').textContent = `$${moneyStats.monthlySpent.toFixed(2)}`;

    // Estimate potential payouts
    const potentialPayouts = totalPassed * state.costs.payoutEstimate;
    document.getElementById('potential-payouts').textContent = `$${potentialPayouts.toLocaleString()}`;

    // Calculate pass rate
    const totalAttempts = state.expenses.filter(e => e.type === 'apex' || e.type === 'lucid').length || totalPassed;
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

    const boughtApex = document.getElementById('bought-apex-eval').checked;
    const boughtLucid = document.getElementById('bought-lucid-eval').checked;

    const entry = {
        date: today,
        boughtApex: boughtApex,
        boughtLucid: boughtLucid,
        tradedOpen: document.getElementById('traded-open').checked,
        accountsPassed: parseInt(document.getElementById('accounts-passed-today').value) || 0
    };

    // Auto-add expenses if checked
    if (boughtApex) {
        state.expenses.push({
            id: Date.now(),
            type: 'apex',
            amount: state.costs.apexEval,
            note: 'Daily Apex eval',
            date: new Date().toISOString()
        });
    }
    if (boughtLucid) {
        state.expenses.push({
            id: Date.now() + 1,
            type: 'lucid',
            amount: state.costs.lucidEval,
            note: 'Daily Lucid eval',
            date: new Date().toISOString()
        });
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
    renderMoneyTracker();
    renderStats();
    renderDailyLog();
}

// Initialize
document.addEventListener('DOMContentLoaded', loadState);
