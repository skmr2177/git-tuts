// Reminder App Class
class ReminderApp {
    constructor() {
        this.reminders = this.loadFromStorage();
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // Add reminder event
        document.getElementById('addReminderBtn').addEventListener('click', () => this.addReminder());
        document.getElementById('reminderInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addReminder();
        });

        // Filter events
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    addReminder() {
        const input = document.getElementById('reminderInput');
        const text = input.value.trim();
        
        if (!text) {
            this.showNotification('Please enter a reminder!', 'error');
            return;
        }

        if (this.editingId) {
            // Update existing reminder
            this.updateReminder(this.editingId, text);
            this.editingId = null;
            document.getElementById('addReminderBtn').innerHTML = '<i class="fas fa-plus"></i> Add Reminder';
        } else {
            // Add new reminder
            const reminder = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            this.reminders.push(reminder);
            this.showNotification('Reminder added successfully!', 'success');
        }

        input.value = '';
        this.saveToStorage();
        this.render();
    }

    updateReminder(id, newText) {
        const reminder = this.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.text = newText;
            this.showNotification('Reminder updated successfully!', 'success');
        }
    }

    toggleComplete(id) {
        const reminder = this.reminders.find(r => r.id === id);
        if (reminder) {
            reminder.completed = !reminder.completed;
            this.saveToStorage();
            this.render();
            
            const message = reminder.completed ? 'Reminder completed!' : 'Reminder marked as active!';
            this.showNotification(message, 'success');
        }
    }

    editReminder(id) {
        const reminder = this.reminders.find(r => r.id === id);
        if (reminder) {
            document.getElementById('reminderInput').value = reminder.text;
            document.getElementById('reminderInput').focus();
            this.editingId = id;
            document.getElementById('addReminderBtn').innerHTML = '<i class="fas fa-edit"></i> Update Reminder';
        }
    }

    deleteReminder(id) {
        if (confirm('Are you sure you want to delete this reminder?')) {
            this.reminders = this.reminders.filter(r => r.id !== id);
            this.saveToStorage();
            this.render();
            this.showNotification('Reminder deleted!', 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    getFilteredReminders() {
        switch (this.currentFilter) {
            case 'active':
                return this.reminders.filter(r => !r.completed);
            case 'completed':
                return this.reminders.filter(r => r.completed);
            default:
                return this.reminders;
        }
    }

    render() {
        const remindersList = document.getElementById('remindersList');
        const filteredReminders = this.getFilteredReminders();
        
        // Update counts
        this.updateCounts();
        
        if (filteredReminders.length === 0) {
            remindersList.innerHTML = this.getEmptyStateHTML();
            return;
        }

        remindersList.innerHTML = filteredReminders
            .map(reminder => this.getReminderHTML(reminder))
            .join('');
        
        // Bind event listeners for reminder actions
        this.bindReminderEvents();
    }

    getReminderHTML(reminder) {
        const completedClass = reminder.completed ? 'completed' : '';
        const checkedClass = reminder.completed ? 'checked' : '';
        
        return `
            <div class="reminder-item ${completedClass}" data-id="${reminder.id}">
                <div class="reminder-checkbox ${checkedClass}" onclick="app.toggleComplete(${reminder.id})"></div>
                <div class="reminder-text ${completedClass}">${this.escapeHtml(reminder.text)}</div>
                <div class="reminder-actions">
                    <button class="action-btn edit-btn" onclick="app.editReminder(${reminder.id})" title="Edit reminder">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="app.deleteReminder(${reminder.id})" title="Delete reminder">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getEmptyStateHTML() {
        const messages = {
            all: {
                icon: 'fas fa-bell-slash',
                title: 'No reminders yet',
                message: 'Add your first reminder to get started!'
            },
            active: {
                icon: 'fas fa-check-circle',
                title: 'No active reminders',
                message: 'All your reminders are completed!'
            },
            completed: {
                icon: 'fas fa-list-check',
                title: 'No completed reminders',
                message: 'Complete some reminders to see them here!'
            }
        };

        const state = messages[this.currentFilter];
        
        return `
            <div class="empty-state">
                <i class="${state.icon}"></i>
                <h3>${state.title}</h3>
                <p>${state.message}</p>
            </div>
        `;
    }

    bindReminderEvents() {
        // Events are bound via onclick attributes for simplicity
        // In a production app, you might want to use event delegation
    }

    updateCounts() {
        const total = this.reminders.length;
        const completed = this.reminders.filter(r => r.completed).length;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
    }

    saveToStorage() {
        localStorage.setItem('dailyReminders', JSON.stringify(this.reminders));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('dailyReminders');
        return stored ? JSON.parse(stored) : [];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            background: type === 'error' ? '#f44336' : 
                       type === 'success' ? '#4caf50' : '#2196f3'
        });

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility method to clear all reminders (for testing)
    clearAllReminders() {
        if (confirm('Are you sure you want to delete all reminders?')) {
            this.reminders = [];
            this.saveToStorage();
            this.render();
            this.showNotification('All reminders cleared!', 'success');
        }
    }
}

// Initialize the app
const app = new ReminderApp();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add reminder
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        app.addReminder();
    }
    
    // Escape to cancel editing
    if (e.key === 'Escape' && app.editingId) {
        app.editingId = null;
        document.getElementById('reminderInput').value = '';
        document.getElementById('addReminderBtn').innerHTML = '<i class="fas fa-plus"></i> Add Reminder';
    }
});

// Add some sample data for demonstration (only on first visit)
if (app.reminders.length === 0) {
    const sampleReminders = [
        { id: 1, text: 'Buy groceries for the week', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Call mom to check in', completed: true, createdAt: new Date().toISOString() },
        { id: 3, text: 'Review and respond to emails', completed: false, createdAt: new Date().toISOString() }
    ];
    
    app.reminders = sampleReminders;
    app.saveToStorage();
    app.render();
}