import { logout } from "./api"; // api.ts からログアウトAPI関数をインポート
import { authStore } from "./authStore"; // authStoreのインスタンスをインポート

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
const API_ENDPOINT = "http://localhost:3000/api/todos"; // TODO: 認証ユーザーのToDoを取得するエンドポイントに変更

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

// ToDo追加フォームの要素を取得 (TODO: フォーム要素をHTMLに追加)
const newTodoTitleInput = document.getElementById("new-todo-title") as HTMLInputElement | null;
const addTodoButton = document.getElementById("add-todo-button") as HTMLButtonElement | null;

// 認証関連の要素を取得
const userInfoElement = document.getElementById("user-info") as HTMLDivElement | null;
const logoutButton = document.getElementById("logout-button") as HTMLButtonElement | null;

// ToDoリスト関連の要素をまとめて取得 (認証状態によって表示/非表示を切り替えるため)
const todoSectionElements = [
    document.querySelector('h1'), // ToDo リストのタイトル
    document.getElementById('error-message'),
    document.getElementById('todo-list'),
    // TODO: ToDo追加フォームの要素もここに追加
].filter(el => el !== null) as HTMLElement[];


/**
 * サーバーから ToDo リストを取得して表示する関数
 * @async
 * @function fetchAndDisplayTodos
 * @returns {Promise<void>}
 */
async function fetchAndDisplayTodos() {
    // 認証済みユーザーのIDを取得 (authStoreから)
    const userId = authStore.getState().user?.id;

    if (userId === undefined) {
        // 未認証の場合は何もしない（リダイレクトされる想定）
        console.warn("User not authenticated. Cannot fetch todos.");
        return;
    }

	try {
        // TODO: 認証ユーザーのToDoを取得するAPIエンドポイントに変更
		const response = await fetch(`${API_ENDPOINT}?userId=${userId}`); // 例: クエリパラメータでユーザーIDを渡す
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

/**
 * 認証状態に応じてUIの表示/非表示を切り替える関数
 * @param isAuthenticated - 認証されているかどうかのフラグ
 * @param userEmail - ユーザーのメールアドレス (認証されている場合)
 * @returns {void}
 */
function updateUIBasedOnAuthStatus(isAuthenticated: boolean, userEmail: string | null) {
    if (isAuthenticated) {
        // 認証済みのUIを表示
        if (userInfoElement) {
            userInfoElement.textContent = `Logged in as: ${userEmail}`;
            userInfoElement.style.display = 'block';
        }
        if (logoutButton) {
            logoutButton.style.display = 'block';
        }
        // ToDoリスト関連要素を表示
        for (const el of todoSectionElements) { // forEach を for...of に変更
            el.style.display = ''; // デフォルト表示に戻す
        }

        // 認証済みの場合のみToDoリストを取得して表示
        fetchAndDisplayTodos();

    } else {
        // 未認証のUIを表示 (ToDoリスト関連要素を非表示)
        if (userInfoElement) {
            userInfoElement.textContent = '';
            userInfoElement.style.display = 'none';
        }
        if (logoutButton) {
            logoutButton.style.display = 'none';
        }
        // ToDoリスト関連要素を非表示
        for (const el of todoSectionElements) { // forEach を for...of に変更
            el.style.display = 'none';
        }

        // 未認証の場合は認証ページへリダイレクト
        if (window.location.pathname !== '/auth.html') { // 既に認証ページにいる場合はリダイレクトしない
             window.location.href = '/auth.html';
        }
    }
}

// authStoreの状態変更を購読し、UIを更新
authStore.subscribe(state => {
    updateUIBasedOnAuthStatus(state.isAuthenticated, state.user?.email || null);
});

// ログアウトボタンのイベントリスナーを設定
logoutButton?.addEventListener('click', async () => {
    try {
        await logout();
        // ログアウト成功時、authStoreの状態が更新され、購読リスナーがUIを更新しリダイレクトを行う
    } catch (error) {
        console.error("Logout failed:", error);
        if (errorMessageElement) {
             errorMessageElement.textContent = "ログアウトに失敗しました";
        }
    }
});


// ページ読み込み時に認証状態をチェックし、UIを初期化
document.addEventListener("DOMContentLoaded", async () => {
    await authStore.checkAuthStatus();
    // checkAuthStatusの完了後、subscribeリスナーがUIを更新し、必要に応じてリダイレクトを行う
});
