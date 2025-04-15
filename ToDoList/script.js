class Todo {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.term = '';
        this.draw();
    }

    draw() {
        const taskListDiv = document.getElementById('task-list');
        taskListDiv.innerHTML = '';

        const filteredTasks = this.getFilteredTasks();

        filteredTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';

            const deadlineDisplay = task.deadline ? ` - ${this.formatDate(task.deadline)}` : '';

            taskDiv.innerHTML = `
                <span onclick="todo.editTask(${index})">${this.highlightTerm(task.text)}${deadlineDisplay}</span>
                <button onclick="todo.removeTask(${index})">Usuń</button>
            `;

            taskListDiv.appendChild(taskDiv);
        });

        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    getFilteredTasks() {
        return this.tasks.filter(task => task.text.toLowerCase().includes(this.term.toLowerCase()));
    }

    highlightTerm(text) {
        if (!this.term) return text;
        const regex = new RegExp(`(${this.term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    searchTasks() {
        this.term = document.getElementById('search').value.trim();
        this.draw();
    }

    addTask() {
        const taskInput = document.getElementById('new-task');
        const deadlineInput = document.getElementById('new-deadline');
        const text = taskInput.value.trim();
        const deadline = deadlineInput.value;

        if (text.length < 3 || text.length > 255) {
            alert('Tekst zadania musi mieć od 3 do 255 znaków!');
            return;
        }

        if (deadline) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlineDate = new Date(deadline);

            if (deadlineDate < today) {
                alert('Data musi być dzisiejsza lub w przyszłości!');
                return;
            }
        }

        this.tasks.push({ text, deadline });
        taskInput.value = '';
        deadlineInput.value = '';
        this.draw();
    }

    removeTask(index) {
        this.tasks.splice(index, 1);
        this.draw();
    }

    editTask(index) {
        const taskDiv = document.querySelector(`#task-list .task:nth-child(${index + 1})`);
        const task = this.tasks[index];

        taskDiv.innerHTML = `
            <input type="text" value="${task.text}" id="edit-text-${index}">
            <input type="date" value="${task.deadline || ''}" id="edit-deadline-${index}">
            <button onclick="todo.removeTask(${index})">Usuń</button>
        `;

        const textInput = document.getElementById(`edit-text-${index}`);
        const deadlineInput = document.getElementById(`edit-deadline-${index}`);

        textInput.addEventListener('focusout', () => this.checkSave(index));
        deadlineInput.addEventListener('focusout', () => this.checkSave(index));

        textInput.focus();
    }

    checkSave(index) {
        const textInput = document.getElementById(`edit-text-${index}`);
        const deadlineInput = document.getElementById(`edit-deadline-${index}`);

        setTimeout(() => {
            if (!textInput.matches(':focus') && !deadlineInput.matches(':focus')) {
                this.saveTask(index);
            }
        }, 0);
    }

    saveTask(index) {
        const textInput = document.getElementById(`edit-text-${index}`);
        const deadlineInput = document.getElementById(`edit-deadline-${index}`);

        const newText = textInput.value.trim();
        const newDeadline = deadlineInput.value;

        if (newText.length >= 3 && newText.length <= 255) {
            this.tasks[index].text = newText;
            this.tasks[index].deadline = newDeadline || null;
            this.draw();
        } else {
            alert('Invalid task text!');
            this.draw();
        }
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-CA', options);
    }
}

const todo = new Todo();