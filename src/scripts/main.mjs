/**
 * @typedef {object} TodoItem
 * @property {number} id - ToDo アイテムのID
 * @property {string} title - ToDo のタイトル
 * @property {boolean} completed - 完了状態
 */

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
        /** @type {TodoItem[]} */
        const todos = await response.json();
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
 * @param {TodoItem[]} todos - ToDo アイテムの配列
 * @returns {void}
 */
function displayTodos(todos) {
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
    todos.forEach((todo) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${todo.title} (${
            todo.completed ? "完了" : "未完了"
        })`;
        todoListElement.appendChild(listItem);
    });
}

// ページ読み込み時に ToDo リストを取得して表示
document.addEventListener("DOMContentLoaded", fetchAndDisplayTodos);
