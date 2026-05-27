// Minimal auth handlers placeholder so the API route imports don't fail during build.
// Replace with real NextAuth handlers or your auth implementation as needed.

export const handlers = {
  GET: async () => {
    return new Response(
      JSON.stringify({ message: 'Auth handler not implemented' }),
      {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
  POST: async () => {
    return new Response(
      JSON.stringify({ message: 'Auth handler not implemented' }),
      {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
