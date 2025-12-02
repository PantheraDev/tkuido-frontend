import Header from "../components/commons/Header";
import Footer from "../components/MainPage/Footer";
import Method from "../components/PayMentPage/Method";
import TotalPay from "../components/PayMentPage/TotalPay";
import Button from "../components/commons/Button";

const PayMent = () => {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna Izquierda: Selección y Formulario */}
          <div className="md:col-span-2 space-y-6">
            <Method />
          </div>
          {/* Columna Derecha: Resumen */}
          <div className="bg-gray-50 p-6 rounded-xl h-fit sticky top-4 border border-gray-200">
            <TotalPay />
            <div className="mt-6">
              <Button text="Proceder al Pago" color="#2B7A57" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PayMent;
