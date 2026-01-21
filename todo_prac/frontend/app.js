let token = localStorage.getItem("token") || "";

const viewSignin = document.getElementById("viewSignin");
const viewSignup = document.getElementById("viewSignup");
const viewApp = document.getElementById("viewApp");

const tokenBadge = document.getElementById("token");
const btnLogout = document.getElementById("btnLogout");

const btnGoSignup = document.getElementById("btnGoSignup");
const btnGoSignin = document.getElementById("btnGoSignin");

const siEmail = document.getElementById("siEmail");
const siPass = document.getElementById("siPass");
const btnSignin = document.getElementById("btnSignin");

const suFirst = document.getElementById("suFirst");
const suLast = document.getElementById("suLast");
const suEmail = document.getElementById("suEmail");
const suPass = document.getElementById("suPass");
const btnSignup = document.getElementById("btnSignup");

const todoTitle = document.getElementById("todoTitle");
const todoDesc = document.getElementById("todoDesc");
const btnAdd = document.getElementById("btnAdd");
const btnRefresh = document.getElementById("btnRefresh");
const list = document.getElementById("list");

const outBox = document.getElementById("out");

function showSignin() {
	viewSignin.classList.remove("hidden");
	viewSignup.classList.add("hidden");
	viewApp.classList.add("hidden");
}

function showSignup() {
	viewSignin.classList.add("hidden");
	viewSignup.classList.remove("hidden");
	viewApp.classList.add("hidden");
}

function showApp() {
	viewSignin.classList.add("hidden");
	viewSignup.classList.add("hidden");
	viewApp.classList.remove("hidden");
}

function setToken(newToken) {
	token = newToken || "";
	localStorage.setItem("token", token);
	tokenBadge.textContent = token ? token.slice(0, 10) + "..." : "";
	btnLogout.classList.toggle("hidden", !token);
}

async function api(path, options) {
	const requestOptions = options || {};
	const headers = { "Content-Type": "application/json" };

	if (token) {
		headers.Authorization = "Bearer " + token;
	}

	const response = await fetch(path, { ...requestOptions, headers });
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw data;
	}

	return data;
}

async function loadTodos() {
	const data = await api("/todos");
	list.innerHTML = "";

	const todos = data.todos || [];
	for (const todo of todos) {
		const li = document.createElement("li");
		li.className = "flex items-center gap-2";

		const title = document.createElement("span");
		title.className = "flex-1";
		title.textContent = todo.description ? todo.title + " - " + todo.description : todo.title;

		const edit = document.createElement("button");
		edit.className = "btn btn-xs";
		edit.textContent = "Edit";
		edit.onclick = async () => {
			const newTitle = prompt("New title", todo.title);
			if (newTitle === null) return;

			const newDescription = prompt("New description (blank = empty)", todo.description || "");
			if (newDescription === null) return;

			try {
				await api("/todos/" + todo.id, {
					method: "PATCH",
					body: JSON.stringify({
						title: newTitle,
						description: newDescription === "" ? null : newDescription,
					}),
				});
				await loadTodos();
			} catch (e) {
				outBox.textContent = JSON.stringify(e, null, 2);
			}
		};

		const del = document.createElement("button");
		del.className = "btn btn-xs btn-error";
		del.textContent = "Delete";
		del.onclick = async () => {
			try {
				await api("/todos/" + todo.id, { method: "DELETE" });
				await loadTodos();
			} catch (e) {
				outBox.textContent = JSON.stringify(e, null, 2);
			}
		};

		li.appendChild(title);
		li.appendChild(edit);
		li.appendChild(del);
		list.appendChild(li);
	}
}

// Default screen: Sign in
showSignin();
setToken(token);

btnGoSignup.onclick = () => {
	outBox.textContent = "";
	showSignup();
};

btnGoSignin.onclick = () => {
	outBox.textContent = "";
	showSignin();
};

btnSignin.onclick = async () => {
	try {
		const result = await api("/auth/sign-in", {
			method: "POST",
			body: JSON.stringify({ email: siEmail.value, password: siPass.value }),
		});

		setToken(result.data.token);
		showApp();
		await loadTodos();
	} catch (e) {
		outBox.textContent = JSON.stringify(e, null, 2);
	}
};

btnSignup.onclick = async () => {
	const email = suEmail.value;
	const password = suPass.value;

	try {
		await api("/auth/sign-up", {
			method: "POST",
			body: JSON.stringify({
				firstName: suFirst.value,
				lastName: suLast.value,
				email,
				password,
			}),
		});

		const result = await api("/auth/sign-in", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});

		setToken(result.data.token);
		showApp();
		await loadTodos();
	} catch (e) {
		outBox.textContent = JSON.stringify(e, null, 2);
	}
};

btnLogout.onclick = () => {
	setToken("");
	list.innerHTML = "";
	outBox.textContent = "";
	showSignin();
};

btnAdd.onclick = async () => {
	try {
		await api("/todos", {
			method: "POST",
			body: JSON.stringify({
				title: todoTitle.value,
				description: todoDesc.value || undefined,
			}),
		});

		todoTitle.value = "";
		todoDesc.value = "";
		await loadTodos();
	} catch (e) {
		outBox.textContent = JSON.stringify(e, null, 2);
	}
};

btnRefresh.onclick = async () => {
	try {
		await loadTodos();
	} catch (e) {
		outBox.textContent = JSON.stringify(e, null, 2);
	}
};
