const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const taskList = document.getElementById("taskList");
const taskInput = document.getElementById("taskInput");
let currentStudent;
let studentTasks = [];
let editTaskNumber;
const editModal = new bootstrap.Modal(document.getElementById("editBox"));

function showMessage(id, text) {
    const message = document.getElementById(id);
    message.textContent = text;
    message.classList.toggle("d-none", !text);
}

document.getElementById("showLogin").onclick = function () {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    this.classList.add("active");
    document.getElementById("showSignup").classList.remove("active");
};

document.getElementById("showSignup").onclick = function () {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    this.classList.add("active");
    document.getElementById("showLogin").classList.remove("active");
};

signupForm.onsubmit = function (event) {
    event.preventDefault();
    const students = JSON.parse(localStorage.getItem("studentAccounts")) || [];
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const skills = [];
    document.querySelectorAll('input[name="skills"]:checked').forEach(function (skill) {
        skills.push(skill.value);
    });

    if (students.find(function (student) { 
        return student.email === email; 
    })) {
        showMessage("signupMessage", "An account with this email already exists.");
        return;
    }

    students.push({
        name: document.getElementById("studentName").value.trim(),
        email: email,
        password: document.getElementById("signupPassword").value,
        age: document.getElementById("age").value,
        course: document.getElementById("course").value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        skills: skills
    });

    localStorage.setItem("studentAccounts", JSON.stringify(students));
    document.getElementById("loginEmail").value = email;
    showMessage("loginMessage", "Account created. Please log in.");
    signupForm.reset();
    document.getElementById("showLogin").click();
};

loginForm.onsubmit = function (event) {
    event.preventDefault();
    const students = JSON.parse(localStorage.getItem("studentAccounts")) || [];
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    currentStudent = students.find(function (student) {
        return student.email === email && student.password === password;
    });

    if (!currentStudent) {
        showMessage("loginMessage", "Email or password is incorrect.");
        return;
    }

    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("portalSection").classList.remove("hidden");
    document.getElementById("userNav").classList.remove("hidden");
    document.getElementById("welcomeName").textContent = "Welcome, " + currentStudent.name + "!";
    studentTasks = JSON.parse(localStorage.getItem("studentTasks_" + email)) || [];
    showTasks();
};

function saveTasks() {
    localStorage.setItem("studentTasks_" + currentStudent.email, JSON.stringify(studentTasks));
}

function showTasks() {
    taskList.innerHTML = "";

    studentTasks.forEach(function (task, number) {
        const item = document.createElement("li");
        const name = document.createElement("span");
        const complete = document.createElement("button");
        const edit = document.createElement("button");
        const remove = document.createElement("button");

        name.textContent = task.text;
        complete.textContent = task.completed ? "Undo" : "Complete";
        edit.textContent = "Edit";
        remove.textContent = "Delete";
        item.className = "list-group-item d-flex align-items-center";
        complete.className = "btn btn-sm " + (task.completed ? "btn-outline-secondary" : "btn-success");
        edit.className = "btn btn-sm btn-outline-primary";
        remove.className = "btn btn-sm btn-outline-danger";
        if (task.completed) item.classList.add("completed");

        function completeTask() {
            studentTasks[number].completed = !studentTasks[number].completed;
            saveTasks();
            showTasks();
        }

        complete.onclick = completeTask;
        name.onclick = completeTask;
        edit.onclick = function () {
            editTaskNumber = number;
            document.getElementById("editTaskInput").value = task.text;
            editModal.show();
        };
        remove.onclick = function () {
            studentTasks.splice(number, 1);
            saveTasks();
            showTasks();
        };

        const actions = document.createElement("div");
        actions.className = "task-actions";
        actions.append(complete, edit, remove);
        item.append(name, actions);
        taskList.appendChild(item);
    });

    const total = studentTasks.length;
    document.getElementById("taskCount").textContent = total + (total === 1 ? " task" : " tasks");
    document.getElementById("emptyTasks").classList.toggle("d-none", total !== 0);
}

document.getElementById("addTaskButton").onclick = function () {
    const text = taskInput.value.trim();
    if (!text) {
        showMessage("taskMessage", "Please enter a task first.");
        return;
    }
    studentTasks.push({ text: text, completed: false });
    taskInput.value = "";
    showMessage("taskMessage", "");
    saveTasks();
    showTasks();
};

document.getElementById("editTaskForm").onsubmit = function (event) {
    event.preventDefault();
    const text = document.getElementById("editTaskInput").value.trim();
    if (text) studentTasks[editTaskNumber].text = text;
    saveTasks();
    showTasks();
    editModal.hide();
};

document.getElementById("profileLink").onclick = function (event) {
    event.preventDefault();
    const student = currentStudent;
    document.getElementById("profileDetails").innerHTML =
        "<p><span class='text-secondary'>Name</span><strong>" + student.name + "</strong></p>" +
        "<p><span class='text-secondary'>Email</span><strong>" + student.email + "</strong></p>" +
        "<p><span class='text-secondary'>Age</span><strong>" + student.age + "</strong></p>" +
        "<p><span class='text-secondary'>Course</span><strong>" + student.course + "</strong></p>" +
        "<p><span class='text-secondary'>Gender</span><strong>" + student.gender + "</strong></p>" +
        "<p><span class='text-secondary'>Skills</span><strong>" + (student.skills.join(", ") || "No skills selected") + "</strong></p>";
    document.getElementById("profile").classList.remove("hidden");
};

document.getElementById("closeProfileButton").onclick = function () {
    document.getElementById("profile").classList.add("hidden");
};

document.getElementById("logoutButton").onclick = function () {
    currentStudent = null;
    studentTasks = [];
    loginForm.reset();
    document.getElementById("portalSection").classList.add("hidden");
    document.getElementById("userNav").classList.add("hidden");
    document.getElementById("authSection").classList.remove("hidden");
};
