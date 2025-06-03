import FormLogin from "../components/LoginPage/FormLogin";
import WelcomeSection from "../components/LoginPage/WelcomeSection";

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col lg:flex-row w-full lg:max-w-4xl xl:max-w-6xl">
        <FormLogin />
        <WelcomeSection />
      </div>
    </div>
  );
};

export default LoginPage;
