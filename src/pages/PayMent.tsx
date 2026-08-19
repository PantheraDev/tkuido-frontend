import { useState } from "react";
import Header from "../components/commons/Header";
import Footer from "../components/MainPage/Footer";
import Method from "../components/PayMentPage/Method";
import TotalPay from "../components/PayMentPage/TotalPay";

const PayMent = () => {
  const [paymentMethod, setPaymentMethod] = useState<
    "nacional" | "internacional" | "pagomovil"
  >("nacional");
  const [isPagoMovilFormValid, setIsPagoMovilFormValid] = useState(false);
  const [isNacionalFormValid, setIsNacionalFormValid] = useState(false);
  const [isInternacionalFormValid, setIsInternacionalFormValid] =
    useState(false);
  const [isPagoMovilSubmitting, setIsPagoMovilSubmitting] = useState(false);
  const [isNacionalSubmitting, setIsNacionalSubmitting] = useState(false);
  const [isInternacionalSubmitting, setIsInternacionalSubmitting] =
    useState(false);

  const pagoMovilFormId = "pagomovil-payment-form";
  const nacionalFormId = "nacional-payment-form";
  const internacionalFormId = "internacional-payment-form";

  const activeFormId =
    paymentMethod === "pagomovil"
      ? pagoMovilFormId
      : paymentMethod === "nacional"
        ? nacionalFormId
        : internacionalFormId;

  const isActiveFormValid =
    paymentMethod === "pagomovil"
      ? isPagoMovilFormValid
      : paymentMethod === "nacional"
        ? isNacionalFormValid
        : isInternacionalFormValid;

  // Evita doble envío/doble cobro: se deshabilita el botón mientras el
  // procesador activo está esperando respuesta del backend.
  const isSubmitting =
    paymentMethod === "pagomovil"
      ? isPagoMovilSubmitting
      : paymentMethod === "nacional"
        ? isNacionalSubmitting
        : isInternacionalSubmitting;

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna Izquierda: Selección y Formulario */}
          <div className="md:col-span-2 space-y-6">
            <Method
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              pagoMovilFormId={pagoMovilFormId}
              nacionalFormId={nacionalFormId}
              internacionalFormId={internacionalFormId}
              onPagoMovilValidityChange={setIsPagoMovilFormValid}
              onNacionalValidityChange={setIsNacionalFormValid}
              onInternacionalValidityChange={setIsInternacionalFormValid}
              onPagoMovilSubmittingChange={setIsPagoMovilSubmitting}
              onNacionalSubmittingChange={setIsNacionalSubmitting}
              onInternacionalSubmittingChange={setIsInternacionalSubmitting}
            />
          </div>
          {/* Columna Derecha: Resumen */}
          <div className="bg-gray-50 p-6 rounded-xl h-fit sticky top-4 border border-gray-200">
            <TotalPay />
            <div className="mt-6">
              <button
                type="submit"
                form={activeFormId}
                disabled={!activeFormId || !isActiveFormValid || isSubmitting}
                className="w-full h-12 rounded-xl bg-[#2B7A57] text-white font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Procesando..." : "Proceder al Pago"}
              </button>
              {!isActiveFormValid && !isSubmitting && (
                <p className="text-xs text-gray-500 mt-2">
                  Completa los campos requeridos para habilitar el pago.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PayMent;
