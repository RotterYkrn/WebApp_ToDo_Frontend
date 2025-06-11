/**
 * ToDo アイテムの型定義 (手動で定義)
 */
interface Todo {
    id: number;
    title: string;
    description: string | null;
    priority: number;
    completed: boolean;
    createdAt: string; // または Date 型、APIレスポンスによる
    updatedAt: string; // または Date 型、APIレスポンスによる
    userId: number;
    categoryId: number | null;
}

/**
 * ToDo アイテムの配列を取得する API エンドポイント
 * @constant {string}
 */
const API_ENDPOINT = "http://localhost:3000/api/todos";

/**
 * ToDo リストを表示する要素
 * @type {HTMLElement | null}
 */
const todoListElement = document.getElementById("todo-list");

/**
 * エラーメッセージを表示する要素
 * @type {HTMLElement | null}
 */
const errorMessageElement = document.getElementById("error-message");

// ToDo追加フォームの要素を取得
const newTodoTitleInput = document.getElementById("new-todo-title") as HTMLInputElement | null;
const addTodoButton = document.getElementById("add-todo-button") as HTMLButtonElement | null;

/**
 * サーバーから ToDo リストを取得して表示する関数
 * @async
 * @function fetchAndDisplayTodos
 * @returns {Promise<void>}
 */
async function fetchAndDisplayTodos() {
	try {
		const response = await fetch(API_ENDPOINT);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const todos: Todo[] = await response.json();
		displayTodos(todos);
	} catch (error) {
		console.error("Failed to fetch todos:", error);
		if (errorMessageElement) {
			errorMessageElement.textContent = "ToDo リストの取得に失敗しました";
		}
	}
}

/**
 * ToDo リストを画面に表示する関数
 * @function displayTodos
 * @param {Todo[]} todos - ToDo アイテムの配列
 * @returns {void}
 */
function displayTodos(todos: Todo[]) {
	if (!todoListElement) {
		console.error("ToDoリストを表示する要素が見つかりません。");
		return;
	}
	todoListElement.innerHTML = ""; // リストをクリア
	if (todos.length === 0) {
		const listItem = document.createElement("li");
		listItem.textContent = "ToDo はありません。";
		todoListElement.appendChild(listItem);
		return;
	}
	for (const todo of todos) {
		const listItem = document.createElement("li");
		listItem.textContent = `${todo.title} (${
			todo.completed ? "完了" : "未完了"
		})`;
		todoListElement.appendChild(listItem);
	}
}

/**
 * 新しい ToDo をサーバーに追加する関数
 * @async
 * @function addTodo
 * @param {string} title - 新しい ToDo のタイトル
 * @returns {Promise<void>}
 */
async function addTodo(title: string) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // サーバー側のPOSTエンドポイントが期待する形式に合わせる
            // description, priority, completed, userId は仮の値またはデフォルト値を使用
            body: JSON.stringify({
                title: title,
                description: "", // 仮の値
                priority: 0, // 仮の値
                completed: false, // デフォルト値
                userId: 1, // 仮のユーザーID
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 成功したらToDoリストを再取得して表示を更新
        fetchAndDisplayTodos();

        // 入力フィールドをクリア
        if (newTodoTitleInput) {
            newTodoTitleInput.value = "";
        }

    } catch (error) {
        console.error("Failed to add todo:", error);
        if (errorMessageElement) {
            errorMessageElement.textContent = "ToDo の追加に失敗しました";
        }
    }
}

// ToDo追加ボタンのイベントリスナーを設定
if (addTodoButton && newTodoTitleInput) {
    addTodoButton.addEventListener("click", () => {
        const title = newTodoTitleInput.value.trim();
        if (title) {
            addTodo(title);
        } else {
            if (errorMessageElement) {
                errorMessageElement.textContent = "タイトルを入力してください";
            }
        }
    });
} else {
    console.error("ToDo追加ボタンまたは入力フィールドが見つかりません。");
}


// ページ読み込み時に ToDo リストを取得して表示
document.addEventListener("DOMContentLoaded", fetchAndDisplayTodos);
