import { Send, Phone, MapPin, Clock } from "lucide-react";

const ContactInfoCards = ({ companyInfo }) => {
  const cards = [
    {
      icon: Send,
      label: "Email Us",
      value: companyInfo?.email,
      sub: "We'll reply within 24 hours",
    },
    {
      icon: Phone,
      label: "Call / WhatsApp",
      value: companyInfo?.whatsappNumber || companyInfo?.phone,
      sub: "Mon - Sat: 10:00 AM - 7:00 PM",
    },
    {
      icon: MapPin,
      label: "Our Location",
      value: companyInfo?.address,
      sub: "We work with clients globally",
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: companyInfo?.workingHours,
      sub: null,
    },
  ].filter((card) => card.value);

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
          Get In Touch
        </span>
      </div>

      {cards.map(({ icon: Icon, label, value, sub }) => (
        <div
          key={label}
          className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-xl p-5"
        >
          <div className="w-10 h-10 rounded-full border border-brand-red/30 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-brand-red" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
              {label}
            </p>
            <p className="text-sm font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactInfoCards;
