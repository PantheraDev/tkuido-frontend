import InstagramIcon from "../icons/InstagramIcon";
import Mail from "../icons/MailIcon";
import TiktokIcon from "../icons/TiktokIcon";
import WhatsappIcon from "../icons/WhatsappIcon";

const ContactLinks = () => {
  return (
    <div className="flex justify-center gap-6 md:flex-row">
      <a
        href="mailto:contacto@tuservicio.com"
        className="text-green-700 font-semibold hover:underline"
      >
        <Mail />
      </a>
      <a
        href="https://wa.me/1234567890"
        className="text-green-700 font-semibold hover:underline"
      >
        <WhatsappIcon />
      </a>
      <a href="#" className="text-green-700 font-semibold hover:underline">
        <InstagramIcon />
      </a>
      <a href="#" className="text-green-700 font-semibold hover:underline">
        <TiktokIcon />
      </a>
    </div>
  );
};

export default ContactLinks;
