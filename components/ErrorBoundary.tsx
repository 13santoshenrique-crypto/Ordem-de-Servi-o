
import React, { ErrorInfo, ReactNode } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary class component to catch rendering errors in the industrial dashboard.
 */
class ErrorBoundary extends React.Component<Props, State> {
  // Fix: Declare state and props explicitly to satisfy TypeScript checks on lines 21, 44, and 45.
  public state: State;
  public props: Props;

  // Explicitly using constructor to resolve potential 'this.props' type inference issues and initialize state
  constructor(props: Props) {
    super(props);
    // @ts-ignore - Ensure props and state are recognized by the compiler
    this.props = props;
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught industrial system error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  /**
   * Render method handles error state or children.
   */
  public render(): ReactNode {
    // Fix: Using explicitly declared state and props on 'this'.
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 font-sans">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-[3rem] p-12 shadow-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="mb-8 flex justify-center">
               <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center animate-pulse border border-red-100">
                  <ShieldAlert size={48} className="text-[#E31B23]" />
               </div>
            </div>
            <h1 className="text-3xl font-black text-[#1A3673] uppercase tracking-tighter mb-2 italic">Interrupção Técnica</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">O sistema detectou uma inconsistência crítica na renderização.</p>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8 text-left overflow-auto max-h-32 custom-scrollbar">
                <p className="text-[10px] font-mono text-red-600 font-bold leading-relaxed">
                    {error?.toString() || 'Erro industrial desconhecido.'}
                </p>
            </div>
            <div className="space-y-4">
                <button 
                    onClick={this.handleReload}
                    className="w-full py-5 bg-[#1A3673] hover:bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                    <RefreshCw size={18} /> Reiniciar Command Center
                </button>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Caso o erro persista, contate a diretoria de tecnologia.</p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
