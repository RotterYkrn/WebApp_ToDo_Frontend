import { login, signup } from "./api"; // api.ts から認証API関数をインポート
import { authStore } from "./authStore"; // authStoreのインスタンスをインポート

const signupForm = document.getElementById('signup-form') as HTMLFormElement | null;
const loginForm = document.getElementById('login-form') as HTMLFormElement | null;
const signupErrorDiv = document.getElementById('signup-error') as HTMLDivElement | null;
const loginErrorDiv = document.getElementById('login-error') as HTMLDivElement | null;

/**
 * 認証状態をチェックし、認証済みならToDoリストページへリダイレクトする
 */
const checkAndRedirect = async () => {
    await authStore.checkAuthStatus();
    if (authStore.getState().isAuthenticated) {
        // 認証済みならToDoリストページへリダイレクト
        window.location.href = '/'; // index.html はルートパス
    }
};

// ページ読み込み時に認証状態をチェック
checkAndRedirect();

/**
 * ユーザー登録フォームの送信イベントハンドラー
 */
signupForm?.addEventListener('submit', async (event) => {
    event.preventDefault(); // フォームのデフォルト送信を防ぐ

    const emailInput = document.getElementById('signup-email') as HTMLInputElement | null;
    const passwordInput = document.getElementById('signup-password') as HTMLInputElement | null;

    if (!emailInput || !passwordInput || !signupErrorDiv) {
        console.error("Signup form elements not found");
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    signupErrorDiv.textContent = ''; // エラーメッセージをクリア

    try {
        await signup(email, password);
        // 登録成功
        alert('ユーザー登録が完了しました。ログインしてください。');
        // 登録フォームをクリア
        emailInput.value = '';
        passwordInput.value = '';
        // 必要であれば、ログインフォームにフォーカスを移すなどのUI変更
    } catch (error: unknown) {
        console.error("Signup failed:", error);
        if (error instanceof Error) {
            signupErrorDiv.textContent = error.message;
        } else {
            signupErrorDiv.textContent = 'ユーザー登録に失敗しました。';
        }
    }
});

/**
 * ユーザーログインフォームの送信イベントハンドラー
 */
loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault(); // フォームのデフォルト送信を防ぐ

    const emailInput = document.getElementById('login-email') as HTMLInputElement | null;
    const passwordInput = document.getElementById('login-password') as HTMLInputElement | null;

    if (!emailInput || !passwordInput || !loginErrorDiv) {
        console.error("Login form elements not found");
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    loginErrorDiv.textContent = ''; // エラーメッセージをクリア

    try {
        await login(email, password);
        // ログイン成功
        // authStoreの状態が更新され、checkAndRedirectがリダイレクト処理を行う
    } catch (error: unknown) {
        console.error("Login failed:", error);
        if (error instanceof Error) {
            loginErrorDiv.textContent = error.message;
        } else {
            loginErrorDiv.textContent = 'ログインに失敗しました。';
        }
    }
});

// authStoreの状態変更を購読し、認証状態に応じてUIを更新することも可能ですが、
// このページでは認証済みならリダイレクトするため、購読は必須ではありません。
// 例:
// authStore.subscribe(state => {
//     if (state.isAuthenticated) {
//         // 認証済みになったらリダイレクト
//         window.location.href = '/';
//     }
// });
