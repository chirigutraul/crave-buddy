import Layout from "../layouts/Layout";
import logo128 from "../assets/logo-128x128.png";
import heroPicture from "../assets/hero-picture.png";
import groceries from "../assets/groceries.jpg";
import preparation from "../assets/preparation.jpg";
import smartSwaps from "../assets/smart-swap.png";
import howItWorks from "../assets/how-it-works.gif";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="pt-16 pb-8 px-16 flex items-center justify-between gap-16"
    >
      <div className="flex-1 max-w-2xl">
        <div className="flex items-center mb-4">
          <img src={logo128} alt="CraveBuddy Logo" className="w-16 h-16 mr-8" />
          <h2 className="font-bold text-gray-800">CraveBuddy</h2>
        </div>

        <h4 className="text-4xl font-bold leading-tight mb-8 text-gray-800">
          Smart swaps. Simple meal plans. Real progress.
        </h4>

        <h6 className="mb-8 text-gray-700">
          Turn any recipe into a healthy, easy-to-follow meal plan:
          auto-generated grocery lists, per-serving nutrition estimates, and
          smart ingredient swaps that cut calories without sacrificing taste.
        </h6>

        <div className="flex gap-4">
          <Button
            size="lg"
            variant="default"
            onClick={() => navigate("/create-recipe")}
          >
            <h6>Get started</h6>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/create-recipe")}
          >
            <h6>Demo</h6>
          </Button>
        </div>
      </div>

      <img
        src={heroPicture}
        alt="CraveBuddy Hero"
        className="max-w-full max-h-[768px] h-auto rounded-xl"
      />
    </section>
  );
}

function Features() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Auto-generated grocery list",
      picture: groceries,
    },
    {
      title: "Smart swaps for less calories",
      picture: smartSwaps,
    },
    {
      title: "Step by step preparation",
      picture: preparation,
    },
  ];
  return (
    <section
      id="features"
      className="flex flex-col items-center gap-8 py-8 px-16 h-screen"
    >
      <h3>Meal preparation made simple.</h3>
      <div className="flex flex-row gap-16 h-full items-center">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col gap-4">
            <div>
              <img
                src={feature.picture}
                alt={feature.title}
                className="mx-auto mb-4 rounded-lg max-h-64"
              />
              <h5 className="font-semibold text-gray-800">{feature.title}</h5>
            </div>
          </div>
        ))}
      </div>
      <Button variant="default" onClick={() => navigate("/create-recipe")}>
        Get started
      </Button>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="about"
      className="flex flex-col items-center gap-8 py-8 px-16 h-screen"
    >
      <h3>How it works?</h3>
      <h5 className="max-w-3xl text-center text-gray-800">
        CraveBuddy leverages the power of Chrome’s built-in AI API’s. All your
        cravings remain private.
      </h5>
      <div className="flex justify-center items-center h-full">
        <img
          src={howItWorks}
          alt="How it works"
          className="mx-auto mb-4 rounded-lg max-h-96"
        />
      </div>
    </section>
  );
}

function Home() {
  return (
    <Layout>
      <HeroSection />
      <Features />
      <HowItWorks />
    </Layout>
  );
}

export default Home;
