import type { User } from "@prisma/client"; // PrismaクライアントからUser型をインポート

// 認証状態とユーザー情報を保持する型
interface AuthState {
    isAuthenticated: boolean;
    user: Omit<User, 'password'> | null; // パスワードを含まないユーザー情報
}

// 状態変更を購読するリスナー関数の型
type AuthStateListener = (state: AuthState) => void;

class AuthStore {
    private state: AuthState = {
        isAuthenticated: false,
        user: null,
    };

    private listeners: AuthStateListener[] = [];

    /**
     * 現在の認証状態を取得する
     * @returns 現在の認証状態
     */
    public getState(): AuthState {
        return this.state;
    }

    /**
     * 認証状態を更新し、リスナーに通知する
     * @param newState - 新しい認証状態の一部または全体
     */
    private setState(newState: Partial<AuthState>): void {
        this.state = { ...this.state, ...newState };
        this.notifyListeners();
    }

    /**
     * 状態変更リスナーを登録する
     * @param listener - 登録するリスナー関数
     * @returns リスナー登録解除関数
     */
    public subscribe(listener: AuthStateListener): () => void {
        this.listeners.push(listener);
        // 購読解除関数を返す
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * 全てのリスナーに状態変更を通知する
     */
    private notifyListeners(): void {
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    /**
     * ユーザーがログインした際に状態を更新する
     * @param user - ログインしたユーザー情報 (パスワードは含まない)
     */
    public login(user: Omit<User, 'password'>): void {
        this.setState({ isAuthenticated: true, user });
    }

    /**
     * ユーザーがログアウトした際に状態を更新する
     */
    public logout(): void {
        this.setState({ isAuthenticated: false, user: null });
    }

    /**
     * アプリケーション起動時などに認証状態を確認し、状態を更新する
     * (サーバーサイドの /api/check-auth エンドポイントを呼び出すロジックは別途実装)
     * @param isAuthenticated - 認証されているかどうかのフラグ
     * @param user - ユーザー情報 (認証されている場合)
     */
    public async checkAuthStatus(): Promise<void> {
        try {
            // TODO: サーバーサイドの /api/check-auth エンドポイントを呼び出す
            // 例: const response = await fetch('/api/check-auth');
            // const data = await response.json();

            // 仮の実装 (常に未認証とする)
            const data = { isAuthenticated: false, user: null }; // 実際のAPIレスポンスに置き換える

            if (data.isAuthenticated && data.user) {
                this.login(data.user);
            } else {
                this.logout();
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
            this.logout(); // エラー発生時もログアウト状態とする
        }
    }
}

// アプリケーション全体で共有するAuthStoreのインスタンス
export const authStore = new AuthStore();

// アプリケーション起動時に認証状態をチェック (非同期処理のため即時実行関数でラップ)
(async () => {
    await authStore.checkAuthStatus();
})();
