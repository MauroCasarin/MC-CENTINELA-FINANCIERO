import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Send, ShieldCheck } from 'lucide-react';

export default function UserRegistrationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Verificar si ya se registró antes
    const hasRegistered = localStorage.getItem('centinela_user_registered');
    if (hasRegistered) {
      setIsRegistered(true);
      return;
    }

    // Temporizador de 1 minuto (60000 ms)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        localStorage.setItem('centinela_user_registered', 'true');
        localStorage.setItem('centinela_user_name', name.trim());
        setIsOpen(false);
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isRegistered || !isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-blue-100 relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                ¡HOLA! QUEREMOS CONOCERTE
              </h2>
              <p className="text-gray-500 text-sm mt-2 font-medium">
                Para continuar navegando en <span className="text-blue-600 font-bold">CENTINELA FINANCIERO</span>, por favor dinos cómo te llamas o tu apodo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Tu Nombre o Apodo
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Inversor_X"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-800"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || name.trim().length < 2}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    CONTINUAR NAVEGANDO
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
              <ShieldCheck className="w-3 h-3" />
              Tus datos están protegidos
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
