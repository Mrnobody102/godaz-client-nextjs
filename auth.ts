/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import api from '@/lib/api';
import { cookies } from 'next/headers';
import { compare } from 'bcryptjs'; // Giả sử bạn sử dụng bcryptjs cho phía client

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        try {
          // Gọi API để tìm user theo email
          const res = await api.post('/auth/login', {
            email: credentials.email as string,
            password: credentials.password as string,
          });

          const user = res.data;

          // Kiểm tra nếu user tồn tại và mật khẩu khớp
          if (user) {
            // Giả sử backend đã kiểm tra mật khẩu, nhưng nếu cần kiểm tra client-side:
            const isMatch = await compare(
              credentials.password as string,
              user.password
            );
            if (isMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      // Gán user ID và role từ token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;
      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      // Gán thông tin user vào token khi đăng nhập
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // Nếu user không có tên, sử dụng phần trước @ của email
        if (user.name === 'NO_NAME' || !user.name) {
          token.name = user.email.split('@')[0];

          // Cập nhật tên user qua API
          try {
            await api.put(`/users/${user.id}`, {
              name: token.name,
            });
          } catch (error) {
            console.error('Error updating user name:', error);
          }
        }

        // Xử lý giỏ hàng khi đăng nhập
        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            try {
              // Kiểm tra giỏ hàng theo sessionCartId
              const res = await api.get(`/cart/${sessionCartId}`);
              const sessionCart = res.data;

              if (sessionCart) {
                // Xóa giỏ hàng hiện tại của user
                await api.delete(`/cart/user/${user.id}`);

                // Gán giỏ hàng mới
                await api.put(`/cart/${sessionCart.id}`, {
                  userId: user.id,
                });
              }
            } catch (error) {
              console.error('Error handling cart:', error);
            }
          }
        }
      }

      // Xử lý cập nhật session
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
