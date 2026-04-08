import React from 'react';
import { SectionContainer } from '../components/SectionContainer';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import type { ContactRequest } from '@/lib/types';

export const Contact = () => {
  const { sendContact, contactProfile } = usePortfolioStore((state) => ({
    sendContact: state.sendContact,
    contactProfile: state.contactProfile,
  }));
  const [formData, setFormData] = React.useState<ContactRequest>({
    name: '',
    email: '',
    message: '',
  });
  const [error, setError] = React.useState('');
  const [isSent, setIsSent] = React.useState(false);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError('');
    setIsSent(false);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!email || !message) {
      setError('Email y mensaje son obligatorios.');
      return;
    }

    await sendContact({
      name: formData.name?.trim() || undefined,
      email,
      message,
    });

    setFormData({ name: '', email: '', message: '' });
    setIsSent(true);
  };

  return (
    <SectionContainer index=".03" id="contact">
      <div className="h-full flex flex-col min-h-[70vh]">
        <div className="flex justify-between items-start mb-20">
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tighter leading-none">GO</span>
            <span className="font-bold text-2xl tracking-tighter leading-none text-accent">FC</span>
          </div>
          <div className="flex gap-8 text-xs font-semibold tracking-widest">
            <a href="#projects" className="hover:text-white text-secondary transition-colors">JORNADAS</a>
            <a href="#contact" className="text-white transition-colors">CONTACTO</a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24 flex-1">
            <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-bold uppercase tracking-widest mb-8">Zona mixta</h3>
                <p className="text-secondary text-sm leading-relaxed mb-12">
                    Si quieres avanzar con tu pipeline, preparar una demo de CI/CD o dejar una propuesta para esta web, enviame un mensaje y lo revisamos.
                </p>

                <div className="space-y-8">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2">Sede</h4>
                        <p className="text-sm">{contactProfile.address}</p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2">Telefono</h4>
                        <p className="text-sm">{contactProfile.phone}</p>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-white/50 mb-2">Email</h4>
                        <p className="text-sm">{contactProfile.email}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-center bg-surface/40 p-8 md:p-12 rounded-sm border border-white/10">
                <h3 className="text-lg font-bold uppercase tracking-widest mb-8">Formulario</h3>
                <form className="space-y-6" onSubmit={onSubmit}>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-secondary">Nombre</label>
                        <input 
                            name="name"
                            type="text" 
                            value={formData.name}
                            onChange={onChange}
                            className="w-full bg-background border-b border-white/10 p-2 focus:border-accent outline-none transition-colors text-sm"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-secondary">Email</label>
                        <input 
                            name="email"
                            type="email" 
                            value={formData.email}
                            onChange={onChange}
                            className="w-full bg-background border-b border-white/10 p-2 focus:border-accent outline-none transition-colors text-sm"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-secondary">Mensaje</label>
                        <textarea 
                            name="message"
                            rows={4}
                            value={formData.message}
                            onChange={onChange}
                            className="w-full bg-background border-b border-white/10 p-2 focus:border-accent outline-none transition-colors text-sm resize-none"
                            placeholder="Cuentame tu idea"
                        ></textarea>
                    </div>
                    {error && <p className="text-xs text-red-300">{error}</p>}
                    {isSent && <p className="text-xs text-emerald-300">Mensaje enviado correctamente.</p>}
                    <button type="submit" className="mt-8 px-8 py-3 bg-accent text-background text-xs font-bold tracking-widest hover:brightness-110 transition-colors uppercase w-full md:w-auto">
                        Enviar
                    </button>
                </form>
            </div>
        </div>

        <div className="mt-20 text-center">
            <p className="text-xs font-bold tracking-[0.2em] mb-2">GRACIAS POR PASAR POR EL ESTADIO</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">© 2026 GitOps Club</p>
        </div>
      </div>
    </SectionContainer>
  );
};
