
import { User } from "../types";
import { INITIAL_USERS } from "../constants";

// Simulação de delay de rede (300-800ms)
const networkDelay = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

// Em produção, isso validaria um hash bcrypt no backend.
// Aqui, verificamos contra a base simulada, mas abstraímos a lógica.
export const authService = {
  login: async (email: string, password: string, users: User[]): Promise<{ success: boolean; user?: User; error?: string }> => {
    await networkDelay();

    // Normalização
    const cleanEmail = email.toLowerCase().trim();
    
    // Busca usuário na lista fornecida (que vem do DB via AppContext) ou na lista inicial como fallback
    const user = users.find(u => u.email.toLowerCase() === cleanEmail) || 
                 INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: "Usuário não encontrado no diretório corporativo." };
    }

    // Validação: 
    // 1. Senha específica do usuário (se definida no DB)
    // 2. Senha mestra (aviagen2026)
    // 3. Senha admin fixa (para Emerson)
    const isValid = (user.password && password === user.password) ||
                    (cleanEmail === "esantos@aviagen.com" && password === "emerson123") || 
                    (password === "aviagen2026") || 
                    (password === "123" && process.env.NODE_ENV !== 'production'); 

    if (isValid) {
      return { success: true, user };
    }

    return { success: false, error: "Credenciais inválidas." };
  },

  resetPassword: async (email: string): Promise<boolean> => {
    await networkDelay();
    return true; // Simula envio de email
  }
};
