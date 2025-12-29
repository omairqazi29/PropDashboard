// Prop Trading Dashboard - Main Application

// Supabase Configuration
const SUPABASE_URL = 'https://idbazylwzyraeabbocyp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EeqQuu0iN1P1yV-VkFeCaw_y93qD5ps';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
        { id: 7, type: 'lucid', amount: 80, note: 'Lucid Flex 50K #1 eval (passed)', date: '2024-12-24T10:00:00.000Z' },
        // Failed evals during the journey
        { id: 8, type: 'lucid', amount: 80, note: 'Lucid eval - failed', date: '2024-12-18T10:00:00.000Z' },
        { id: 9, type: 'lucid', amount: 80, note: 'Lucid eval - failed', date: '2024-12-19T10:00:00.000Z' },
        { id: 10, type: 'lucid', amount: 80, note: 'Lucid eval - failed', date: '2024-12-21T10:00:00.000Z' },
        { id: 11, type: 'apex', amount: 25, note: 'Apex eval - failed', date: '2024-12-23T10:00:00.000Z' }
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

// Load state from Supabase (fallback to localStorage)
async function loadState() {
    let loaded = false;

    // Try loading from Supabase first
    try {
        const { data, error } = await supabase
            .from('dashboard_state')
            .select('state')
            .eq('id', 'default')
            .single();

        if (data && data.state && Object.keys(data.state).length > 0) {
            Object.assign(state, data.state);
            loaded = true;
            console.log('Loaded from Supabase');
        }
    } catch (err) {
        console.error('Supabase load error:', err);
    }

    // Fallback to localStorage
    if (!loaded) {
        const saved = localStorage.getItem('propDashboard');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
            console.log('Loaded from localStorage');
        }
    }

    // Ensure expenses array exists for older saves
    if (!state.expenses) state.expenses = [];
    // Ensure new cost fields exist
    if (!state.costs.apexActivation) state.costs.apexActivation = 65;
    if (!state.costs.payoutEstimate) state.costs.payoutEstimate = 2000;

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

// Save state to localStorage and Supabase
async function saveState() {
    localStorage.setItem('propDashboard', JSON.stringify(state));

    // Sync to Supabase
    try {
        await supabase
            .from('dashboard_state')
            .upsert({ id: 'default', state: state, updated_at: new Date().toISOString() });
    } catch (err) {
        console.error('Supabase sync error:', err);
    }
}

// Reset all data
async function resetData() {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
        localStorage.removeItem('propDashboard');
        // Clear Supabase
        try {
            await supabase
                .from('dashboard_state')
                .upsert({ id: 'default', state: {}, updated_at: new Date().toISOString() });
        } catch (err) {
            console.error('Supabase reset error:', err);
        }
        location.reload();
    }
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

// Account limits
const ACCOUNT_LIMITS = {
    apex: 20,
    lucid: 5
};

// Add new account
function addAccount(type) {
    const accounts = state.accounts[type];
    const limit = ACCOUNT_LIMITS[type];
    const passedCount = accounts.filter(a => a.status === 'passed').length;

    if (passedCount >= limit) {
        alert(`Max ${limit} ${type === 'apex' ? 'Apex' : 'Lucid'} funded accounts reached!`);
        return;
    }

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

// US Market holidays
const holidays = {
    2025: ['2025-01-01', '2025-01-20', '2025-02-17', '2025-04-18', '2025-05-26', '2025-06-19', '2025-07-04', '2025-09-01', '2025-11-27', '2025-12-25'],
    2026: ['2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25']
};

// Check if a date is a market day
function isMarketDay(date) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    const dateStr = date.toISOString().split('T')[0];
    const year = date.getFullYear();
    const yearHolidays = holidays[year] || [];

    return !yearHolidays.includes(dateStr);
}

// Check if date is a holiday
function isHoliday(date) {
    const dateStr = date.toISOString().split('T')[0];
    const year = date.getFullYear();
    const yearHolidays = holidays[year] || [];
    return yearHolidays.includes(dateStr);
}

// Get market days count between two dates
function getMarketDaysCount(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        if (isMarketDay(current)) count++;
        current.setDate(current.getDate() + 1);
    }
    return count;
}

// Render calendar
function renderCalendar() {
    const month = parseInt(document.getElementById('sim-month').value);
    const year = parseInt(document.getElementById('sim-year').value);
    const passRate = parseFloat(document.getElementById('sim-pass-rate').value) / 100;
    const payoutPerAccount = parseFloat(document.getElementById('sim-payout').value);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Current accounts and expenses
    const currentApexPassed = state.accounts.apex.filter(a => a.status === 'passed').length;
    const currentLucidPassed = state.accounts.lucid.filter(a => a.status === 'passed').length;
    const currentTotalPassed = currentApexPassed + currentLucidPassed;
    const currentStats = calculateMoneyStats();

    let calendarHTML = '';
    let dayCounter = 1;

    // Track cumulative stats separately for apex and lucid
    let cumulativeApexPassed = currentApexPassed;
    let cumulativeLucidPassed = currentLucidPassed;
    let cumulativeExpenses = currentStats.totalSpent;

    // Calculate market days from today to start of selected month
    if (firstDay > today) {
        const daysToStart = getMarketDaysCount(today, new Date(firstDay.getTime() - 86400000));
        // Pre-month calculation
        for (let i = 0; i < daysToStart; i++) {
            // Stop buying when we've PASSED the limit (using floor to count actual funded accounts)
            const canBuyApex = Math.floor(cumulativeApexPassed) < ACCOUNT_LIMITS.apex;
            const canBuyLucid = Math.floor(cumulativeLucidPassed) < ACCOUNT_LIMITS.lucid;

            if (canBuyApex) {
                cumulativeExpenses += state.costs.apexEval;
                cumulativeApexPassed += passRate;
                // Cap at limit
                if (cumulativeApexPassed > ACCOUNT_LIMITS.apex) {
                    cumulativeApexPassed = ACCOUNT_LIMITS.apex;
                }
                // Activation cost for newly passed account
                cumulativeExpenses += passRate * state.costs.apexActivation;
            }
            if (canBuyLucid) {
                cumulativeExpenses += state.costs.lucidEval;
                cumulativeLucidPassed += passRate;
                // Cap at limit
                if (cumulativeLucidPassed > ACCOUNT_LIMITS.lucid) {
                    cumulativeLucidPassed = ACCOUNT_LIMITS.lucid;
                }
            }
        }
    }

    // Generate calendar grid (6 rows max)
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            const cellIndex = row * 7 + col;

            if (cellIndex < startDayOfWeek || dayCounter > daysInMonth) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            } else {
                const currentDate = new Date(year, month, dayCounter);
                const isWeekend = col === 0 || col === 6;
                const isHolidayDay = isHoliday(currentDate);
                const isToday = currentDate.getTime() === today.getTime();
                const isPast = currentDate < today;
                const isMarket = isMarketDay(currentDate);

                let classes = 'calendar-day';
                if (isWeekend) classes += ' weekend';
                if (isHolidayDay) classes += ' holiday';
                if (isToday) classes += ' today';
                if (isPast) classes += ' past';

                // Calculate cumulative stats for this day
                if (isMarket && !isPast) {
                    // Stop buying when we've PASSED the limit (using floor to count actual funded accounts)
                    const canBuyApex = Math.floor(cumulativeApexPassed) < ACCOUNT_LIMITS.apex;
                    const canBuyLucid = Math.floor(cumulativeLucidPassed) < ACCOUNT_LIMITS.lucid;

                    if (canBuyApex) {
                        cumulativeExpenses += state.costs.apexEval;
                        cumulativeApexPassed += passRate;
                        if (cumulativeApexPassed > ACCOUNT_LIMITS.apex) {
                            cumulativeApexPassed = ACCOUNT_LIMITS.apex;
                        }
                        cumulativeExpenses += passRate * state.costs.apexActivation;
                    }
                    if (canBuyLucid) {
                        cumulativeExpenses += state.costs.lucidEval;
                        cumulativeLucidPassed += passRate;
                        if (cumulativeLucidPassed > ACCOUNT_LIMITS.lucid) {
                            cumulativeLucidPassed = ACCOUNT_LIMITS.lucid;
                        }
                    }
                }

                const totalAccounts = Math.floor(cumulativeApexPassed) + Math.floor(cumulativeLucidPassed);
                const totalPayout = totalAccounts * payoutPerAccount;

                calendarHTML += `
                    <div class="${classes}">
                        <span class="day-number">${dayCounter}</span>
                        ${!isPast && !isWeekend ? `
                            <div class="day-stats">
                                <div class="stat-row">
                                    <span class="stat-label">Accts</span>
                                    <span class="stat-value accounts">${totalAccounts}</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Pay</span>
                                    <span class="stat-value payout">$${(totalPayout/1000).toFixed(1)}k</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;

                dayCounter++;
            }
        }
        if (dayCounter > daysInMonth) break;
    }

    document.getElementById('calendar-grid').innerHTML = calendarHTML;

    // Calculate end of month stats
    const endOfMonth = new Date(year, month + 1, 0);
    let marketDaysInMonth = 0;
    const checkDate = new Date(Math.max(today.getTime(), firstDay.getTime()));
    while (checkDate <= endOfMonth) {
        if (isMarketDay(checkDate)) marketDaysInMonth++;
        checkDate.setDate(checkDate.getDate() + 1);
    }

    // Calculate final stats using the cumulative values from calendar render
    const finalApexPassed = Math.floor(cumulativeApexPassed);
    const finalLucidPassed = Math.floor(cumulativeLucidPassed);
    const finalTotalAccounts = finalApexPassed + finalLucidPassed;
    const finalTotalExpenses = cumulativeExpenses;
    const finalPayout = finalTotalAccounts * payoutPerAccount;
    const netProfit = finalPayout - finalTotalExpenses;

    // Render summary
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendar-summary').innerHTML = `
        <div class="summary-item">
            <div class="label">End of ${monthNames[month]}</div>
            <div class="value purple">${finalTotalAccounts} accounts</div>
        </div>
        <div class="summary-item">
            <div class="label">Total Expenses</div>
            <div class="value red">$${finalTotalExpenses.toLocaleString()}</div>
        </div>
        <div class="summary-item">
            <div class="label">Potential Payout</div>
            <div class="value green">$${finalPayout.toLocaleString()}</div>
        </div>
        <div class="summary-item">
            <div class="label">Net Profit</div>
            <div class="value ${netProfit >= 0 ? 'green' : 'red'}">$${netProfit.toLocaleString()}</div>
        </div>
    `;
}

// Initialize calendar
function initSimulator() {
    renderCalendar();
}

// Main render function
function render() {
    renderDailyTasks();
    renderAccounts();
    renderMoneyTracker();
    renderStats();
    renderDailyLog();
}

// Tab navigation
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');

            // Re-render calendar when switching to projections tab
            if (tabId === 'projections') {
                renderCalendar();
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadState();
    initSimulator();
});
