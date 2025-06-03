import FormSignUp from "../components/SignUpPage/FormSignUp";
import WelcomeSignUpSection from "../components/SignUpPage/WelcomeSignUpSection";

const SignUpPage = () => {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col lg:flex-row w-full lg:max-w-4xl xl:max-w-6xl">
          <WelcomeSignUpSection />
          <FormSignUp />
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
