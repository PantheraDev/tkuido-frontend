import FormForgotPassword from "../components/LoginPage/FormForgotPassword";
import WelcomeSection from "../components/LoginPage/WelcomeSection";

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col lg:flex-row w-full lg:max-w-4xl xl:max-w-6xl">
        <FormForgotPassword />
        <WelcomeSection />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
