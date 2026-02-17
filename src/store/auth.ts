import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/services/api'

interface AuthState {
  isAuthenticated: boolean
  user: { id: string; username: string } | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: async (username: string, password: string) => {
        try {
          const response = await api.login(username, password)
          if (response.success && response.data) {
            // 登录成功后，api.login 已经将 token 保存到 localStorage
            // 这里只需要更新 store 状态
            set({
              isAuthenticated: true,
              user: response.data.user,
              token: response.data.token,
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Login error:', error)
          return false
        }
      },

      logout: async () => {
        try {
          await api.logout()
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
          })
          // 清除 localStorage 中的 token
          localStorage.removeItem('chatbot_token')
          localStorage.removeItem('chatbot_refresh_token')
        }
      },

      checkAuth: () => {
        // 优先从 localStorage 获取 token（api.login 保存的位置）
        const localStorageToken = localStorage.getItem('chatbot_token')
        const storeToken = get().token
        
        // 如果 localStorage 中有 token
        if (localStorageToken) {
          // 确保 api 实例加载了 token
          api.loadToken()
          
          // 如果 store 中没有 token，说明可能是页面刷新，需要同步状态
          if (!storeToken) {
            // 尝试从 localStorage 恢复用户信息
            const savedState = localStorage.getItem('auth-storage')
            if (savedState) {
              try {
                const parsed = JSON.parse(savedState)
                if (parsed.state?.user) {
                  set({
                    isAuthenticated: true,
                    user: parsed.state.user,
                    token: localStorageToken,
                  })
                  return
                }
              } catch (e) {
                console.error('Failed to parse saved auth state:', e)
              }
            }
            
            // 如果没有保存的用户信息，至少设置认证状态
            set({ 
              isAuthenticated: true,
              token: localStorageToken 
            })
          } else {
            // store 中有 token，只需要确保认证状态正确
            set({ isAuthenticated: true })
          }
        } else if (storeToken) {
          // 如果只有 store 中有 token，同步到 localStorage
          localStorage.setItem('chatbot_token', storeToken)
          api.loadToken()
          set({ isAuthenticated: true })
        } else {
          // 两边都没有 token
          set({ isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      // 只持久化部分状态
      partialize: (state) => ({ 
        user: state.user,
        token: state.token 
      }),
    }
  )
)