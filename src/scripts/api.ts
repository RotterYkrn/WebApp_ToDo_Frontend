import type { User } from "@prisma/client"; // PrismaクライアントからUser型をインポート
import { authStore } from "./authStore"; // authStoreのインスタンスをインポート

/**
 * ユーザー登録APIを呼び出す関数
 * @param email - 登録するユーザーのメールアドレス
 * @param password - 登録するユーザーのパスワード
 * @returns 登録されたユーザー情報 (パスワードを含まない)
 * @throws {Error} ユーザー登録に失敗した場合
 */
export const signup = async (email: string, password: string): Promise<Omit<User, 'password'>> => {
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign up');
    }

    const user: Omit<User, 'password'> = await response.json();
    // 登録成功時はログイン状態にはしない（ログインは別途行う）
    return user;
};

/**
 * ユーザーログインAPIを呼び出す関数
 * @param email - ログインするユーザーのメールアドレス
 * @param password - ログインするユーザーのパスワード
 * @returns ログインしたユーザー情報 (パスワードを含まない)
 * @throws {Error} ログインに失敗した場合
 */
export const login = async (email: string, password: string): Promise<Omit<User, 'password'>> => {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log in');
    }

    const user: Omit<User, 'password'> = await response.json();
    // ログイン成功時、authStoreの状態を更新
    authStore.login(user);
    return user;
};

// ユーザーログアウトAPIを呼び出す関数
export const logout = async (): Promise<{ message: string }> => {
    const response = await fetch('/api/logout', {
        method: 'POST', // セッション破棄のためPOSTを使用
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log out');
    }

    const data: { message: string } = await response.json();
    // ログアウト成功時、authStoreの状態を更新
    authStore.logout();
    return data;
};

/**
 * 認証状態チェックAPIを呼び出す関数
 * アプリケーション起動時などに現在の認証状態を確認するために使用
 * @returns 認証状態とユーザー情報 (認証済みの場合)
 * @throws {Error} 認証状態の確認に失敗した場合 (401以外のエラー)
 */
export const checkAuth = async (): Promise<{ isAuthenticated: boolean; user?: Omit<User, 'password'> }> => {
    const response = await fetch('/api/check-auth');

    if (response.status === 401) {
        // 未認証の場合
        authStore.logout(); // 念のためログアウト状態にする
        return { isAuthenticated: false };
    }

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error checking auth status:", errorData);
        authStore.logout(); // エラー発生時もログアウト状態とする
        throw new Error(errorData.message || 'Failed to check authentication status');
    }

    const data: { isAuthenticated: boolean; user?: Omit<User, 'password'> } = await response.json();

    if (data.isAuthenticated && data.user) {
        authStore.login(data.user);
    } else {
        authStore.logout();
    }

    return data;
};

// アプリケーション起動時に認証状態をチェック (authStoreで既に実行されているため、ここでは不要ですが、API関数として定義)
// checkAuth(); // authStoreのインスタンス生成時に呼び出される
