
import { User } from "../types";
import { INITIAL_USERS } from "../constants";

// Simulação de delay de rede (300-800ms)
const networkDelay = () => new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

// Em produção, isso validaria um hash bcrypt no backend.
// Aqui, verificamos contra a base simulada, mas abstraímos a lógica.
export const authService = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    await networkDelay();

    // Normalização
    const cleanEmail = email.toLowerCase().trim();
    
    // Busca usuário (Lógica simulada de Backend)
    // OBS: As senhas em 'constants.ts' foram removidas. 
    // Em um app real, o backend validaria o hash. 
    // Para este frontend "stand-alone", aceitaremos uma senha padrão segura se configurada, ou validaremos contra um mock seguro.
    
    const user = INITIAL_USERS.find(u => u.email === cleanEmail);

    if (!user) {
      return { success: false, error: "Usuário não encontrado no diretório corporativo." };
    }

    // Validação de "Senha Mestra" para demonstração ou senha específica
    // Em produção: if (await bcrypt.compare(password, user.passwordHash)) ...
    const isValid = (password === "aviagen2026") || (password === "123" && process.env.NODE_ENV !== 'production'); 

    if (isValid) {
      // Retorna usuário sem dados sensíveis (se houvesse)
      return { success: true, user };
    }

    return { success: false, error: "Credenciais inválidas." };
  },

  resetPassword: async (email: string): Promise<boolean> => {
    await networkDelay();
    return true; // Simula envio de email
  }
};
